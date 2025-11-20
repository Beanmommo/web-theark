import { defineStore } from "pinia";
import type { Invoice } from "@/types/data";

export const useInvoicesStore = defineStore("invoices", () => {
  const dayjs = useDayjs();

  const fetchNewInvoiceId = async () => {
    const invoiceId = await $fetch(`/api/invoices/id`);
    return invoiceId;
  };

  const addInvoice = async (invoiceData: Partial<Invoice>) => {
    const newInvoiceId = await fetchNewInvoiceId();
    if (!newInvoiceId) return;
    const finalInvoiceData = {
      ...invoiceData,
      id: newInvoiceId,
      submittedDate: dayjs().format(),
    };
    const invoiceSubmittedData = await $fetch(`/api/invoices`, {
      method: "POST",
      body: JSON.stringify(finalInvoiceData),
    });
    return invoiceSubmittedData;
  };

  const updateInvoiceBookingKey = async (
    invoiceKey: string,
    bookingKey: string
  ) => {
    const data = await $fetch(`/api/invoices/update`, {
      method: "POST",
      body: JSON.stringify({ invoiceKey, data: { bookingKey } }),
    });
    return data;
  };

  const updateInvoiceCreditPackageKey = async (
    invoiceKey: string,
    creditPackageKey: string
  ) => {
    const data = await $fetch(`/api/invoices/update`, {
      method: "POST",
      body: JSON.stringify({ invoiceKey, data: { creditPackageKey } }),
    });
    return data;
  };

  const fetchInvoiceByKey = async (invoiceKey: string): Promise<Invoice> => {
    const invoiceData = await $fetch<Invoice>(`/api/invoices/${invoiceKey}`);
    return invoiceData;
  };

  const updateInvoicePaymentMethod = async (
    invoiceKey: string,
    paymentMethod: string
  ) => {
    const data = await $fetch(`/api/invoices/update`, {
      method: "POST",
      body: JSON.stringify({
        invoiceKey,
        data: { paymentMethod },
      }),
    });
    return data;
  };

  const updateInvoiceCreditRefundKey = async (
    invoiceKey: string,
    creditRefundKey: string,
    originalBookingKey: string
  ) => {
    const data = await $fetch(`/api/invoices/update`, {
      method: "POST",
      body: JSON.stringify({
        invoiceKey,
        data: {
          creditRefundKey,
          originalBookingKey,
        },
      }),
    });
    return data;
  };

  return {
    addInvoice,
    updateInvoiceBookingKey,
    updateInvoiceCreditPackageKey,
    fetchInvoiceByKey,
    updateInvoicePaymentMethod,
    updateInvoiceCreditRefundKey,
  };
});
