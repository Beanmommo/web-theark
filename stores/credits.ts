import { defineStore } from 'pinia'
import type { CreditPackage, CreditPackageData, Invoice, PackageDetails, InvoiceBooking } from '../types/data'
import orderBy from 'lodash/orderBy'

export const useCreditsStore = defineStore('credits', () =>
{
  const currentUserPackages = ref([] as Array<CreditPackage>)
  const purchasedCreditsLeft = ref(0)
  const totalCreditsLeft = ref(0)
  const dayjs = useDayjs()
  const fetchUserCredits = async () =>
  {
    const user = useAuthUser()
    if (user.value)
    {
      const userCreditPackages: CreditPackageData = await $fetch(`/api/credits/${user.value.uid}`);
      const paidCredits = {} as CreditPackageData
      if (userCreditPackages)
        Object.keys(userCreditPackages).forEach((key: keyof CreditPackageData) =>
        {
          if (userCreditPackages[key].paymentStatus !== "Pending" && userCreditPackages[key].creditsLeft !== 0)
          {
            paidCredits[key] = { ...userCreditPackages[key] };
          }
        });
      setUserPackages(paidCredits)
      return paidCredits
    }
    return {}

  }

  function setUserPackages(packages: CreditPackageData)
  {
    let userPackages = [] as CreditPackage[];
    let totalCredits = 0;
    let purchasedCredits = 0;
    Object.keys(packages).forEach((key) =>
    {
      const { creditsLeft, expiryDate, paymentMethod, value } = packages[key]
      const notExpired = dayjs().isSameOrBefore(expiryDate, "day")
      if (notExpired)
      {
        userPackages.push({
          ...packages[key],
          key,
        });
        const creditsLeftNumber = Number(creditsLeft)
        if (creditsLeftNumber && creditsLeftNumber > 0)
        {
          if (paymentMethod !== "Refund")
            purchasedCredits += Number(creditsLeftNumber);
          totalCredits += Number(creditsLeftNumber);
        } else if (creditsLeft === undefined)
        {
          totalCredits += parseInt(value)
        }
      }

    });
    currentUserPackages.value = orderBy(userPackages,
      (pkg: CreditPackage) => dayjs(pkg.expiryDate).format("YYYYMMDD"),
      "asc"
    );
    purchasedCreditsLeft.value = purchasedCredits
    totalCreditsLeft.value = totalCredits
  }

  const addCreditPackage = async (invoiceData: Invoice, packageItem: PackageDetails) =>
  {

    const customerDetails = {
      name: invoiceData.name,
      contact: invoiceData.contact,
      email: invoiceData.email,
      userKey: invoiceData.userId
    }

    const expiryDate = dayjs().add(packageItem.expiryPeriod, 'months').format()

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
    }
    const creditPackageKey = await $fetch('/api/credits', {
      method: 'POST',
      body: JSON.stringify(creditPackageData)
    });
    return creditPackageKey
  }

  const updateCreditPackage = async ({ key, creditsLeft }: { key: string, creditsLeft: number }) =>
  {
    const creditPackageKey = await $fetch(`api/credits/id/${key}`, {
      method: 'POST',
      body: JSON.stringify({ creditsLeft })
    })
    return creditPackageKey
  }

  const fetchNewCreditReceiptId = async () =>
  {
    const creditReceiptId = await $fetch(`/api/creditReceipt/id`);
    return creditReceiptId
  }

  const addCreditReceipt = async (invoiceData: InvoiceBooking, remainingCredits: number, creditPackageKeys: string[]) =>
  {
    const id = await fetchNewCreditReceiptId()
    const customerDetails = {
      name: invoiceData.name,
      contact: invoiceData.contact,
      email: invoiceData.email,
      userKey: invoiceData.userId
    }

    const bookingDetails = {
      slots: invoiceData.slots,
      location: invoiceData.location,
      date: invoiceData.date,
      slotKeys: invoiceData.slotKeys
    }

    const creditReceiptData = {
      id,
      ...customerDetails,
      ...bookingDetails,
      submittedDate: dayjs().format(),
      remainingCredits,
      creditPackageKeys,
      total: invoiceData.total
    }

    await $fetch(`/api/creditReceipt/add`, {
      method: 'POST',
      body: JSON.stringify(creditReceiptData)
    });
    return creditReceiptData

  }


  return {
    addCreditPackage,
    updateCreditPackage,
    fetchUserCredits,
    currentUserPackages,
    purchasedCreditsLeft,
    totalCreditsLeft,
    addCreditReceipt
  }
})