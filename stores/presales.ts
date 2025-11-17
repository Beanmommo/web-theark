import { defineStore } from 'pinia'
import type { TotalCostData, CustomerDetails, PaymentData, BookingDetails, Presale, Invoice, PackageDetails, PresaleBooking, PresalePackage } from '@/types/data'
import { InvoiceType } from '@/types/data'
export const usePresalesStore = defineStore('presales', () =>
{
  const totalCostData = ref({} as TotalCostData)
  const customerData = ref({} as Partial<CustomerDetails>)
  const paymentData = ref({} as PaymentData)
  const bookingDetails = ref({} as BookingDetails)
  const packageDetails = ref({} as PackageDetails)
  const dayjs = useDayjs()

  const presaleData = computed(() =>
  {
    const data = {
      ...totalCostData.value,
      ...customerData.value,
      ...paymentData.value,
      ...bookingDetails.value,
    } as PresaleBooking;

    // Normalize typeOfSports if it exists
    if (data.typeOfSports) {
      data.typeOfSports = data.typeOfSports.toLowerCase();
    }

    // Normalize typeOfSports in slots if they exist
    if (data.slots) {
      data.slots = data.slots.map(slot => ({
        ...slot,
        typeOfSports: slot.typeOfSports?.toLowerCase() || 'futsal'
      }));
    }

    return data;
  })
  const presalePackageData = computed(() =>
  {
    return {
      ...packageDetails.value,
      ...totalCostData.value,
      ...customerData.value,
      ...paymentData.value,
    } as PresalePackage
  })

  const fetchNewPresaleId = async () =>
  {
    const presaleId = await $fetch(`/api/presales/id`);
    return presaleId
  }

  const addPresale = async (): Promise<Presale> =>
  {
    const newPresaleId = await fetchNewPresaleId()
    if (!newPresaleId) return {} as Invoice;
    let finalPresaleData = {
      ...presaleData.value,
      id: newPresaleId,
      submittedDate: dayjs().format(),
      invoiceType: InvoiceType.BOOKING,
      databaseVersion: 'firestore' as const
    }
    const presaleSubmittedData = await $fetch(`/api/presales`, {
      method: 'POST',
      body: JSON.stringify(finalPresaleData)
    });
    if (!presaleSubmittedData) return {} as Invoice;
    const finalInvoiceData = {
      ...presaleSubmittedData,
      presaleId: newPresaleId
    }
    return finalInvoiceData
  }

  const updatePresale = async (presaleKey: string) =>
  {
    const data = await $fetch(`/api/presales/update`, {
      method: 'POST',
      body: JSON.stringify({ presaleKey, data: { paymentStatus: 'Paid' } })
    });
    return data
  }

  const addPackagePresale = async (): Promise<Presale> =>
  {
    const newPresaleId = await fetchNewPresaleId()
    if (!newPresaleId) return {} as Invoice;
    let finalPresaleData = {
      ...presalePackageData.value,
      id: newPresaleId,
      invoiceType: InvoiceType.CREDITPACKAGE,
      submittedDate: dayjs().format(),
      databaseVersion: 'firestore' as const
    }
    const presaleSubmittedData = await $fetch(`/api/presales`, {
      method: 'POST',
      body: JSON.stringify(finalPresaleData)
    });
    if (!presaleSubmittedData) return {} as Invoice;
    const finalInvoiceData = {
      ...presaleSubmittedData,
      presaleId: newPresaleId
    }
    return finalInvoiceData
  }

  const updateCustomerData = (customerDetails: Partial<CustomerDetails>) =>
  {
    customerData.value = {
      ...customerData.value,
      ...customerDetails
    }
  }

  const updatePaymentData = (paymentDetails: PaymentData) =>
  {
    paymentData.value = paymentDetails
  }

  const updateTotalCostData = (totalCostDetails: TotalCostData) =>
  {
    totalCostData.value = totalCostDetails
  }

  const updateBookingDetails = (booking: BookingDetails) => 
  {
    bookingDetails.value = booking
  }

  const updatePackageDetails = (packageItem: PackageDetails) => 
  {
    packageDetails.value = packageItem
  }

  const updateSlotKeys = (slotKeys: string[]) =>
  {
    bookingDetails.value = {
      ...bookingDetails.value,
      slotKeys: slotKeys
    }
  }

  return {
    fetchNewPresaleId,
    addPresale,
    updatePresale,
    addPackagePresale,
    updateCustomerData,
    updateTotalCostData,
    updatePaymentData,
    updateBookingDetails,
    updatePackageDetails,
    updateSlotKeys,
    totalCostData,
    customerData,
    paymentData,
    bookingDetails,
    packageDetails,
    presaleData,
    presalePackageData
  }
})