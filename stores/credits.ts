import { defineStore } from "pinia";
import type {
  Booking,
  CreditPackage,
  CreditPackageData,
  CreditRefund,
  CreditRefundData,
  CreditReceipt,
  Invoice,
  PackageDetails,
  InvoiceBooking,
} from "../types/data";
import orderBy from "lodash/orderBy";

export const useCreditsStore = defineStore("credits", () => {
  const currentUserPackages = ref([] as Array<CreditPackage>);
  const purchasedCreditsLeft = ref(0);
  const totalCreditsLeft = ref(0);
  const refundCreditsLeft = ref(0);
  const currentCreditRefunds = ref([] as Array<CreditRefund>);
  const dayjs = useDayjs();
  const fetchUserCreditsAndRefunds = async () => {
    const user = useAuthUser();
    if (!user.value) return { credits: {}, refunds: {} };

    // 1. Single call to /api/credits/${uid} (RTDB + Firestore creditPackages)
    const userCreditPackages: CreditPackageData = await $fetch(
      `/api/credits/${user.value.uid}`
    );

    // 2. Single call to /api/creditRefunds/${uid} (Firestore creditRefunds)
    const userCreditRefunds: CreditRefundData = await $fetch(
      `/api/creditRefunds/${user.value.uid}`
    );

    // 3. Process creditPackages - separate purchased vs refunds
    const purchasedCredits = {} as CreditPackageData;
    const refundsFromPackages = {} as CreditRefundData;

    if (userCreditPackages) {
      Object.keys(userCreditPackages).forEach(
        (key: keyof CreditPackageData) => {
          const pkg = userCreditPackages[key];

          // Skip pending or empty credits
          if (pkg.paymentStatus === "Pending" || pkg.creditsLeft === 0) {
            return;
          }

          // Separate by payment method
          if (pkg.paymentMethod === "Refund") {
            // This is a refund credit (legacy location)
            refundsFromPackages[key] = {
              ...pkg,
              refundInvoiceKey: pkg.invoiceKey || "",
              originalBookingKey: pkg.originalBookingKey || "",
              cancelledDate: pkg.cancelledDate || pkg.submittedDate,
              cancelledBy: pkg.cancelledBy || "system",
            } as CreditRefund;
          } else {
            // This is a purchased credit
            purchasedCredits[key] = { ...pkg };
          }
        }
      );
    }

    // 4. Process creditRefunds collection
    const refundsFromCollection = {} as CreditRefundData;
    if (userCreditRefunds) {
      Object.keys(userCreditRefunds).forEach((key: keyof CreditRefundData) => {
        const refund = userCreditRefunds[key];

        // Skip pending or empty refunds
        if (refund.paymentStatus !== "Pending" && refund.creditsLeft !== 0) {
          refundsFromCollection[key] = { ...refund };
        }
      });
    }

    // 5. Merge refunds (creditRefunds collection takes precedence)
    const allRefunds: CreditRefundData = {
      ...refundsFromPackages,
      ...refundsFromCollection,
    };

    // 6. Update state
    setUserPackages(purchasedCredits);
    setUserCreditRefunds(allRefunds);

    console.log(
      `Fetched ${Object.keys(purchasedCredits).length} purchased credits`
    );
    console.log(
      `Fetched ${
        Object.keys(refundsFromPackages).length
      } refunds from creditPackages`
    );
    console.log(
      `Fetched ${
        Object.keys(refundsFromCollection).length
      } refunds from creditRefunds collection`
    );
    console.log(`Total refunds: ${Object.keys(allRefunds).length}`);

    return { credits: purchasedCredits, refunds: allRefunds };
  };

  function setUserPackages(packages: CreditPackageData) {
    let userPackages = [] as CreditPackage[];
    let totalCredits = 0;
    let purchasedCredits = 0;
    Object.keys(packages).forEach((key) => {
      const { creditsLeft, expiryDate, paymentMethod, value } = packages[key];
      const notExpired = dayjs().isSameOrBefore(expiryDate, "day");

      // IMPORTANT: Exclude refund credits (they're handled separately in fetchUserCreditsAndRefunds)
      if (notExpired && paymentMethod !== "Refund") {
        userPackages.push({
          ...packages[key],
          key,
        });
        const creditsLeftNumber = Number(creditsLeft);
        if (creditsLeftNumber && creditsLeftNumber > 0) {
          purchasedCredits += Number(creditsLeftNumber);
          totalCredits += Number(creditsLeftNumber);
        } else if (creditsLeft === undefined) {
          totalCredits += parseInt(value);
          purchasedCredits += parseInt(value);
        }
      }
    });
    currentUserPackages.value = orderBy(
      userPackages,
      (pkg: CreditPackage) => dayjs(pkg.expiryDate).format("YYYYMMDD"),
      "asc"
    );
    purchasedCreditsLeft.value = purchasedCredits;
    totalCreditsLeft.value = totalCredits;
  }



  function setUserCreditRefunds(creditRefunds: CreditRefundData) {
    let userCreditRefunds = [] as CreditRefund[];
    let refundCredits = 0;

    Object.keys(creditRefunds).forEach((key) => {
      const { creditsLeft, expiryDate, value } = creditRefunds[key];
      const notExpired = dayjs().isSameOrBefore(expiryDate, "day");

      if (notExpired) {
        userCreditRefunds.push({
          ...creditRefunds[key],
          key,
        });

        const creditsLeftNumber = Number(creditsLeft);
        if (creditsLeftNumber && creditsLeftNumber > 0) {
          refundCredits += Number(creditsLeftNumber);
        } else if (creditsLeft === undefined) {
          refundCredits += parseInt(value);
        }
      }
    });

    currentCreditRefunds.value = orderBy(
      userCreditRefunds,
      (credit: CreditRefund) => dayjs(credit.expiryDate).format("YYYYMMDD"),
      "asc"
    );
    refundCreditsLeft.value = refundCredits;

    // Update total credits to include refunds
    totalCreditsLeft.value = purchasedCreditsLeft.value + refundCredits;
  }

  const addCreditPackage = async (
    invoiceData: Invoice,
    packageItem: PackageDetails
  ) => {
    const customerDetails = {
      name: invoiceData.name,
      contact: invoiceData.contact,
      email: invoiceData.email,
      userKey: invoiceData.userId,
    };

    const expiryDate = dayjs().add(packageItem.expiryPeriod, "months").format();

    const creditPackageData: CreditPackage = {
      ...customerDetails,
      amount: packageItem.amount,
      value: packageItem.value,
      creditsLeft: parseInt(packageItem.value),
      expiryDate,
      creditPackage: packageItem,
      paymentMethod: invoiceData.paymentMethod,
      paymentStatus: invoiceData.paymentStatus,
      submittedDate: dayjs().format(),
    };
    const creditPackageKey = await $fetch("/api/credits", {
      method: "POST",
      body: JSON.stringify(creditPackageData),
    });
    return creditPackageKey;
  };

  const updateCreditPackage = async ({
    key,
    creditsLeft,
  }: {
    key: string;
    creditsLeft: number;
  }) => {
    const creditPackageKey = await $fetch(`/api/credits/id/${key}`, {
      method: "PATCH",
      body: JSON.stringify({ creditsLeft }),
    });
    return creditPackageKey;
  };

  const fetchNewCreditReceiptId = async (): Promise<string> => {
    const creditReceiptId = await $fetch<string>(`/api/creditReceipt/id`);
    return creditReceiptId;
  };

  const addCreditReceipt = async (
    invoiceData: InvoiceBooking,
    remainingCredits: number,
    creditPackageKeys: string[]
  ): Promise<string> => {
    const id = await fetchNewCreditReceiptId();
    const customerDetails = {
      name: invoiceData.name,
      contact: invoiceData.contact,
      email: invoiceData.email,
      userKey: invoiceData.userId, // Map userId to userKey for CreditReceipt (database uses userKey)
    };

    const bookingDetails = {
      slots: invoiceData.slots,
      location: invoiceData.location,
      date: invoiceData.date,
      slotKeys: invoiceData.slotKeys,
    };

    const creditReceiptData = {
      id,
      ...customerDetails,
      ...bookingDetails,
      submittedDate: dayjs().format(),
      remainingCredits,
      creditPackageKeys,
      total: invoiceData.total,
    };

    await $fetch(`/api/creditReceipt/add`, {
      method: "POST",
      body: JSON.stringify(creditReceiptData),
    });
    return id; // Return the credit receipt ID
  };

  const addCreditRefund = async (
    refundInvoiceData: Invoice | CreditReceipt | Booking,
    refundPackage: PackageDetails,
    originalBookingKey: string
  ) => {
    // Handle both userId (Invoice/Booking) and userKey (CreditReceipt)
    const userKey = 'userId' in refundInvoiceData
      ? refundInvoiceData.userId
      : refundInvoiceData.userKey;

    const customerDetails = {
      name: refundInvoiceData.name,
      contact: refundInvoiceData.contact,
      email: refundInvoiceData.email,
      userKey, // CreditRefund uses userKey in database
    };

    const expiryDate = dayjs()
      .add(refundPackage.expiryPeriod, "months")
      .format();

    // Determine the type of data we received
    // Booking has paymentMethod but no 'id' field (it has 'key' instead)
    // Invoice has both paymentMethod and 'id'
    // CreditReceipt has 'id' but no paymentMethod
    const isBooking = "paymentMethod" in refundInvoiceData && !("id" in refundInvoiceData);
    const isInvoice = "paymentMethod" in refundInvoiceData && "id" in refundInvoiceData;

    const paymentMethod = isBooking || isInvoice
      ? refundInvoiceData.paymentMethod
      : "Credit" as any; // CreditReceipts are always paid with credits

    const paymentStatus = isBooking || isInvoice
      ? refundInvoiceData.paymentStatus
      : "Paid"; // CreditReceipts are always paid

    // For Booking objects, we don't have an invoice/receipt ID to link
    const refundInvoiceKey = "id" in refundInvoiceData
      ? refundInvoiceData.id
      : undefined;

    const creditRefundData = {
      ...customerDetails,
      amount: refundPackage.amount,
      value: refundPackage.value,
      creditsLeft: parseInt(refundPackage.value),
      expiryDate,
      creditPackage: refundPackage,
      paymentMethod,
      paymentStatus,
      submittedDate: dayjs().format(),
      refundInvoiceKey,
      originalBookingKey: originalBookingKey,
      cancelledDate: new Date().toISOString(),
      cancelledBy: "system",
    } as CreditRefund;

    const creditRefundKey = await $fetch("/api/creditRefunds", {
      method: "POST",
      body: JSON.stringify(creditRefundData),
    });

    return creditRefundKey;
  };

  const updateCreditRefund = async ({
    key,
    creditsLeft,
  }: {
    key: string;
    creditsLeft: number;
  }) => {
    // Single call to PATCH endpoint that handles all fallbacks
    const result = await $fetch(`/api/creditRefunds/id/${key}`, {
      method: "PATCH",
      body: JSON.stringify({ creditsLeft }),
    });

    console.log(`Updated credit refund ${key} in ${result.database}`);
    return result;
  };

  const fetchCreditReceiptByKey = async (
    creditReceiptKey: string
  ): Promise<CreditReceipt> => {
    const creditReceiptData = await $fetch<CreditReceipt>(
      `/api/creditReceipt/${creditReceiptKey}`
    );
    return creditReceiptData;
  };

  return {
    addCreditPackage,
    updateCreditPackage,
    fetchUserCreditsAndRefunds,
    currentUserPackages,
    purchasedCreditsLeft,
    totalCreditsLeft,
    addCreditReceipt,
    fetchCreditReceiptByKey,
    // Refund credit functions
    addCreditRefund,
    updateCreditRefund,
    currentCreditRefunds,
    refundCreditsLeft,
  };
});
