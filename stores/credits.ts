import { defineStore } from "pinia";
import type {
  CreditPackage,
  CreditPackageData,
  CreditRefund,
  CreditRefundData,
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
  const fetchUserCredits = async () => {
    const user = useAuthUser();
    if (user.value) {
      const userCreditPackages: CreditPackageData = await $fetch(
        `/api/credits/${user.value.uid}`
      );
      const paidCredits = {} as CreditPackageData;
      if (userCreditPackages)
        Object.keys(userCreditPackages).forEach(
          (key: keyof CreditPackageData) => {
            if (
              userCreditPackages[key].paymentStatus !== "Pending" &&
              userCreditPackages[key].creditsLeft !== 0
            ) {
              paidCredits[key] = { ...userCreditPackages[key] };
            }
          }
        );
      setUserPackages(paidCredits);
      return paidCredits;
    }
    return {};
  };

  function setUserPackages(packages: CreditPackageData) {
    let userPackages = [] as CreditPackage[];
    let totalCredits = 0;
    let purchasedCredits = 0;
    Object.keys(packages).forEach((key) => {
      const { creditsLeft, expiryDate, paymentMethod, value } = packages[key];
      const notExpired = dayjs().isSameOrBefore(expiryDate, "day");

      // IMPORTANT: Exclude refund credits (they're handled separately in fetchUserCreditRefunds)
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

  const fetchUserCreditRefunds = async () => {
    const user = useAuthUser();
    if (!user.value) return {};

    // 1. FETCH FROM creditPackages (where paymentMethod === "Refund")
    const userCreditPackages: CreditPackageData = await $fetch(
      `/api/credits/${user.value.uid}`
    );
    const refundsFromPackages = {} as CreditRefundData;

    if (userCreditPackages) {
      Object.keys(userCreditPackages).forEach(
        (key: keyof CreditPackageData) => {
          const pkg = userCreditPackages[key];

          // Filter for refund credits only
          if (
            pkg.paymentMethod === "Refund" &&
            pkg.paymentStatus !== "Pending" &&
            pkg.creditsLeft !== 0
          ) {
            // Convert CreditPackage to CreditRefund format
            refundsFromPackages[key] = {
              ...pkg,
              refundInvoiceKey: pkg.invoiceKey || "",
              originalBookingKey: pkg.originalBookingKey || "",
              cancelledDate: pkg.cancelledDate || pkg.submittedDate,
              cancelledBy: pkg.cancelledBy || "system",
            } as CreditRefund;
          }
        }
      );
    }

    console.log(
      `Fetched ${
        Object.keys(refundsFromPackages).length
      } refund credits from creditPackages`
    );

    // 2. FETCH FROM creditRefunds collection
    const userCreditRefunds: CreditRefundData = await $fetch(
      `/api/creditRefunds/${user.value.uid}`
    );

    const refundsFromCollection = {} as CreditRefundData;
    if (userCreditRefunds) {
      Object.keys(userCreditRefunds).forEach((key: keyof CreditRefundData) => {
        if (
          userCreditRefunds[key].paymentStatus !== "Pending" &&
          userCreditRefunds[key].creditsLeft !== 0
        ) {
          refundsFromCollection[key] = { ...userCreditRefunds[key] };
        }
      });
    }

    console.log(
      `Fetched ${
        Object.keys(refundsFromCollection).length
      } refund credits from creditRefunds collection`
    );

    // 3. MERGE BOTH SOURCES (creditRefunds takes precedence)
    const allRefunds: CreditRefundData = {
      ...refundsFromPackages,
      ...refundsFromCollection,
    };

    console.log(`Total refund credits: ${Object.keys(allRefunds).length}`);

    setUserCreditRefunds(allRefunds);
    return allRefunds;
  };

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
    const creditPackageKey = await $fetch(`api/credits/id/${key}`, {
      method: "POST",
      body: JSON.stringify({ creditsLeft }),
    });
    return creditPackageKey;
  };

  const fetchNewCreditReceiptId = async () => {
    const creditReceiptId = await $fetch(`/api/creditReceipt/id`);
    return creditReceiptId;
  };

  const addCreditReceipt = async (
    invoiceData: InvoiceBooking,
    remainingCredits: number,
    creditPackageKeys: string[]
  ) => {
    const id = await fetchNewCreditReceiptId();
    const customerDetails = {
      name: invoiceData.name,
      contact: invoiceData.contact,
      email: invoiceData.email,
      userKey: invoiceData.userId,
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
    return creditReceiptData;
  };

  const addCreditRefund = async (
    refundInvoiceData: Invoice,
    refundPackage: PackageDetails,
    originalBookingKey: string
  ) => {
    const customerDetails = {
      name: refundInvoiceData.name,
      contact: refundInvoiceData.contact,
      email: refundInvoiceData.email,
      userKey: refundInvoiceData.userId,
    };

    const expiryDate = dayjs()
      .add(refundPackage.expiryPeriod, "months")
      .format();

    const creditRefundData = {
      ...customerDetails,
      amount: refundPackage.amount,
      value: refundPackage.value,
      creditsLeft: parseInt(refundPackage.value),
      expiryDate,
      creditPackage: refundPackage,
      paymentMethod: refundInvoiceData.paymentMethod,
      paymentStatus: refundInvoiceData.paymentStatus,
      submittedDate: dayjs().format(),
      refundInvoiceKey: refundInvoiceData.id,
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
    // Try to update in creditRefunds collection first
    try {
      const result = await $fetch(`api/creditRefunds/id/${key}`, {
        method: "POST",
        body: JSON.stringify({ creditsLeft }),
      });
      console.log(`Updated credit refund ${key} in creditRefunds collection`);
      return result;
    } catch (error) {
      console.log(
        `Credit refund ${key} not found in creditRefunds, trying creditPackages...`
      );

      // If not found, try creditPackages (legacy refunds)
      try {
        const result = await $fetch(`api/credits/id/${key}`, {
          method: "POST",
          body: JSON.stringify({ creditsLeft }),
        });
        console.log(`Updated credit refund ${key} in creditPackages`);
        return result;
      } catch (error2) {
        console.error(
          `Failed to update credit refund ${key} in both collections`,
          error2
        );
        throw error2;
      }
    }
  };

  return {
    addCreditPackage,
    updateCreditPackage,
    fetchUserCredits,
    currentUserPackages,
    purchasedCreditsLeft,
    totalCreditsLeft,
    addCreditReceipt,
    // Refund credit functions
    fetchUserCreditRefunds,
    addCreditRefund,
    updateCreditRefund,
    currentCreditRefunds,
    refundCreditsLeft,
  };
});
