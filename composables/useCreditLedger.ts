import type {
  CreditTransaction,
  CreditTransactionType,
  CreditType,
  PackageAllocation,
  CreditPackage,
  CreditRefund,
} from "~/types/data";
import dayjs from "dayjs";

/**
 * Composable for managing credit ledger system
 * Implements two-level ledger: Credit Transactions + Package Allocations
 * Uses FIFO (First In, First Out) strategy for multi-package bookings
 */
export const useCreditLedger = () => {
  /**
   * Get user's current balance from latest credit transaction
   */
  const getCurrentBalance = async (userKey: string): Promise<number> => {
    try {
      const transactions = await $fetch<any>(
        `/api/creditTransactions/${userKey}`
      );

      if (!transactions || Object.keys(transactions).length === 0) return 0;

      // Convert to array and sort by timestamp descending
      const transactionArray = Object.values(
        transactions
      ) as CreditTransaction[];
      transactionArray.sort(
        (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
      );

      return transactionArray[0].balanceAfter || 0;
    } catch (error) {
      console.error("Error getting current balance:", error);
      return 0;
    }
  };

  /**
   * Allocate credits using Priority Allocation:
   * 1. Refund credits FIRST (oldest first)
   * 2. Then purchased packages (FIFO - oldest first)
   */
  const allocateCreditsFromPackages = (
    amount: number,
    packages: CreditPackage[],
    refunds: CreditRefund[]
  ): Array<{
    packageKey: string;
    amount: number;
    packageBalanceBefore: number;
    packageBalanceAfter: number;
    collection: "creditPackages" | "creditRefunds";
  }> => {
    const allocations: Array<{
      packageKey: string;
      amount: number;
      packageBalanceBefore: number;
      packageBalanceAfter: number;
      collection: "creditPackages" | "creditRefunds";
    }> = [];
    let remaining = amount;

    // PRIORITY 1: Use refund credits FIRST (sorted by date, oldest first)
    const sortedRefunds = [...refunds].sort(
      (a, b) =>
        dayjs(a.submittedDate).valueOf() - dayjs(b.submittedDate).valueOf()
    );

    for (const refund of sortedRefunds) {
      if (remaining <= 0) break;

      const available = refund.creditsLeft || 0;
      if (available <= 0) continue;

      const toUse = Math.min(available, remaining);

      allocations.push({
        packageKey: refund.key || "",
        amount: -toUse, // Negative for usage
        packageBalanceBefore: available,
        packageBalanceAfter: available - toUse,
        collection: "creditRefunds",
      });

      remaining -= toUse;
    }

    // PRIORITY 2: Then use purchased packages (FIFO - oldest first)
    if (remaining > 0) {
      const sortedPackages = [...packages].sort(
        (a, b) =>
          dayjs(a.submittedDate).valueOf() - dayjs(b.submittedDate).valueOf()
      );

      for (const pkg of sortedPackages) {
        if (remaining <= 0) break;

        const available = pkg.creditsLeft || 0;
        if (available <= 0) continue;

        const toUse = Math.min(available, remaining);

        allocations.push({
          packageKey: pkg.key || "",
          amount: -toUse, // Negative for usage
          packageBalanceBefore: available,
          packageBalanceAfter: available - toUse,
          collection: "creditPackages",
        });

        remaining -= toUse;
      }
    }

    if (remaining > 0) {
      throw new Error(
        `Insufficient credits. Need ${amount}, but only ${
          amount - remaining
        } available.`
      );
    }

    return allocations;
  };

  // Type for pre-calculated credit allocations
  type PreCalculatedAllocation = {
    packageKey: string;
    amount: number; // Negative for usage, positive for refund
    packageBalanceBefore: number;
    packageBalanceAfter: number;
    collection: "creditPackages" | "creditRefunds";
  };

  /**
   * Record credit usage for a booking
   * Creates SEPARATE transactions for each credit type (REFUND vs PACKAGE) for accurate reporting.
   * @param preCalculatedAllocations - Pre-calculated allocations from handleMembershipCreditPayment.
   *                      If not provided, will calculate using packages/refunds (legacy behavior).
   */
  const recordUsage = async (
    userKey: string,
    email: string,
    name: string,
    contact: string,
    amount: number,
    packages: CreditPackage[],
    refunds: CreditRefund[],
    bookingKey: string,
    slotKeys: string[],
    bookingDate: string,
    location: string,
    slots: any[],
    preCalculatedAllocations?: PreCalculatedAllocation[]
  ): Promise<void> => {
    const timestamp = new Date().toISOString();

    // Validate sport type matching (if slots have typeOfSports)
    const bookingSportType = slots[0]?.typeOfSports?.toLowerCase();
    if (bookingSportType) {
      // Validate packages
      for (const pkg of packages) {
        const pkgSportType =
          pkg.creditPackage?.typeOfSports?.toLowerCase() ?? "futsal";
        if (pkgSportType !== bookingSportType) {
          console.error(
            `Sport type mismatch: Package ${pkg.key} is for ${pkgSportType} but booking is for ${bookingSportType}`
          );
          throw new Error(
            `Cannot use ${pkgSportType} credits for ${bookingSportType} booking. Please use matching sport credits.`
          );
        }
      }

      // Validate refunds
      for (const refund of refunds) {
        const refundSportType =
          refund.creditPackage?.typeOfSports?.toLowerCase() ?? "futsal";
        if (refundSportType !== bookingSportType) {
          console.error(
            `Sport type mismatch: Refund ${refund.key} is for ${refundSportType} but booking is for ${bookingSportType}`
          );
          throw new Error(
            `Cannot use ${refundSportType} credits for ${bookingSportType} booking. Please use matching sport credits.`
          );
        }
      }
    }

    // Use pre-calculated allocations if provided, otherwise calculate (legacy)
    const allocations =
      preCalculatedAllocations ||
      allocateCreditsFromPackages(amount, packages, refunds);

    // Group allocations by credit type (REFUND vs PACKAGE)
    const refundAllocations = allocations.filter(
      (a) => a.collection === "creditRefunds"
    );
    const packageAllocations = allocations.filter(
      (a) => a.collection === "creditPackages"
    );

    // Create separate transaction for REFUND credits (if any were used)
    if (refundAllocations.length > 0) {
      const refundBalanceBefore = refundAllocations.reduce(
        (sum, a) => sum + a.packageBalanceBefore,
        0
      );
      const refundBalanceAfter = refundAllocations.reduce(
        (sum, a) => sum + a.packageBalanceAfter,
        0
      );
      const refundAmount = refundAllocations.reduce(
        (sum, a) => sum + a.amount,
        0
      ); // Already negative

      const refundTransaction: Omit<CreditTransaction, "id"> = {
        userKey,
        email,
        name,
        contact,
        type: "USAGE",
        creditType: "REFUND",
        timestamp,
        amount: refundAmount,
        balanceBefore: refundBalanceBefore,
        balanceAfter: refundBalanceAfter,
        bookingKey,
        description: `Booking at ${location} on ${bookingDate} - $${Math.abs(
          refundAmount
        )} (refund credits)`,
        bookingDate,
        location,
        slots,
        slotKeys,
      };

      const refundTransactionId = await $fetch<string>(
        "/api/creditTransactions",
        {
          method: "POST",
          body: refundTransaction,
        }
      );

      // Create package allocations for refund credits
      for (const alloc of refundAllocations) {
        const allocation: Omit<PackageAllocation, "id"> = {
          transactionId: refundTransactionId,
          packageKey: alloc.packageKey,
          collection: alloc.collection,
          amount: alloc.amount,
          packageBalanceBefore: alloc.packageBalanceBefore,
          packageBalanceAfter: alloc.packageBalanceAfter,
          timestamp,
          userKey,
          email,
        };

        await $fetch("/api/packageAllocations", {
          method: "POST",
          body: allocation,
        });
      }
    }

    // Create separate transaction for PACKAGE credits (if any were used)
    if (packageAllocations.length > 0) {
      const packageBalanceBefore = packageAllocations.reduce(
        (sum, a) => sum + a.packageBalanceBefore,
        0
      );
      const packageBalanceAfter = packageAllocations.reduce(
        (sum, a) => sum + a.packageBalanceAfter,
        0
      );
      const packageAmount = packageAllocations.reduce(
        (sum, a) => sum + a.amount,
        0
      ); // Already negative

      const packageTransaction: Omit<CreditTransaction, "id"> = {
        userKey,
        email,
        name,
        contact,
        type: "USAGE",
        creditType: "PACKAGE",
        timestamp,
        amount: packageAmount,
        balanceBefore: packageBalanceBefore,
        balanceAfter: packageBalanceAfter,
        bookingKey,
        description: `Booking at ${location} on ${bookingDate} - $${Math.abs(
          packageAmount
        )} (purchased credits)`,
        bookingDate,
        location,
        slots,
        slotKeys,
      };

      const packageTransactionId = await $fetch<string>(
        "/api/creditTransactions",
        {
          method: "POST",
          body: packageTransaction,
        }
      );

      // Create package allocations for purchased credits
      for (const alloc of packageAllocations) {
        const allocation: Omit<PackageAllocation, "id"> = {
          transactionId: packageTransactionId,
          packageKey: alloc.packageKey,
          collection: alloc.collection,
          amount: alloc.amount,
          packageBalanceBefore: alloc.packageBalanceBefore,
          packageBalanceAfter: alloc.packageBalanceAfter,
          timestamp,
          userKey,
          email,
        };

        await $fetch("/api/packageAllocations", {
          method: "POST",
          body: allocation,
        });
      }
    }
  };

  /**
   * Record credit package purchase
   */
  const recordPurchase = async (
    userKey: string,
    email: string,
    name: string,
    contact: string,
    amount: number,
    packageKey: string
  ): Promise<void> => {
    const currentBalance = await getCurrentBalance(userKey);
    const newBalance = currentBalance + amount;
    const timestamp = new Date().toISOString();

    // Create transaction (Firestore will auto-generate ID)
    const transaction: Omit<CreditTransaction, "id"> = {
      userKey,
      email,
      name,
      contact,
      type: "PURCHASE",
      timestamp,
      amount: amount,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      packageKey,
      description: `Purchased credit package - $${amount}`,
    };

    const transactionId = await $fetch<string>("/api/creditTransactions", {
      method: "POST",
      body: transaction,
    });

    // Create package allocation (Firestore will auto-generate ID)
    const allocation: Omit<PackageAllocation, "id"> = {
      transactionId,
      packageKey,
      collection: "creditPackages",
      amount: amount, // Positive for purchase (credits added)
      packageBalanceBefore: 0,
      packageBalanceAfter: amount,
      timestamp,
      userKey,
      email,
    };

    await $fetch("/api/packageAllocations", {
      method: "POST",
      body: allocation,
    });
  };

  /**
   * Record credit refund for a booking cancellation
   * Creates a new refund "package" in creditRefunds collection
   * @param balanceBeforeRefund - The user's balance BEFORE the refund was added to DB.
   *                              If not provided, will query current balance (but this may be incorrect
   *                              if the refund has already been added to DB).
   */
  const recordRefund = async (
    bookingKey: string,
    userKey: string,
    email: string,
    name: string,
    contact: string,
    amount: number,
    refundPackageKey: string,
    reason: string,
    balanceBeforeRefund?: number
  ): Promise<void> => {
    // For refunds, the balance shown should be just this refund package (0 -> amount)
    // Similar to how usage shows only the credits used
    const packageBalanceBefore = 0;
    const packageBalanceAfter = amount;
    const timestamp = new Date().toISOString();

    // Create refund transaction (Firestore will auto-generate ID)
    const transaction: Omit<CreditTransaction, "id"> = {
      userKey,
      email,
      name,
      contact,
      type: "REFUND",
      timestamp,
      amount: amount, // Positive for refund
      balanceBefore: packageBalanceBefore, // Refund package starts at 0
      balanceAfter: packageBalanceAfter, // Refund package now has the amount
      bookingKey,
      packageKey: refundPackageKey,
      description: `Refund for booking cancellation - $${amount}`,
      notes: reason,
    };

    const transactionId = await $fetch<string>("/api/creditTransactions", {
      method: "POST",
      body: transaction,
    });

    // Create package allocation for the new refund package
    const allocation: Omit<PackageAllocation, "id"> = {
      transactionId,
      packageKey: refundPackageKey,
      collection: "creditRefunds",
      amount: amount, // Positive for refund (credits added)
      packageBalanceBefore: packageBalanceBefore,
      packageBalanceAfter: packageBalanceAfter,
      timestamp,
      userKey,
      email,
    };

    await $fetch("/api/packageAllocations", {
      method: "POST",
      body: allocation,
    });
  };

  return {
    getCurrentBalance,
    allocateCreditsFromPackages,
    recordUsage,
    recordPurchase,
    recordRefund,
  };
};
