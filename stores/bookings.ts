import { defineStore } from "pinia";
import type { Booking, Invoice, BookingData } from "@/types/data";

export const useBookingsStore = defineStore("bookings", () => {
  const myBookings = ref<Booking[]>([]);
  const dayjs = useDayjs();

  const fetchMyBookings = async (email: string) => {
    const bookingData = await $fetch<BookingData>(`/api/bookings/${email}`);
    const bookings: Booking[] = [];
    if (!bookingData) return [];
    Object.keys(bookingData).forEach((key) => {
      bookings.push({ ...bookingData[key], key });
    });
    myBookings.value = useSortBy(bookings, "date").reverse();
    return myBookings.value;
  };

  const addBooking = async (
    invoiceData: Invoice,
    slotKeys: string[],
    sport: string
  ) => {
    const costDetails = {
      subtotal: invoiceData.subtotal,
      total: invoiceData.total,
      gst: invoiceData.gst,
      totalPayable: invoiceData.totalPayable,
      discount: invoiceData.discount,
      transactionFee: invoiceData.transactionFee,
    };

    const customerDetails = {
      name: invoiceData.name,
      contact: invoiceData.contact,
      email: invoiceData.email,
      userId: invoiceData.userId,
    };

    const bookingData: Booking = {
      location: invoiceData.location,
      slots: slotKeys,
      paymentMethod: invoiceData.paymentMethod,
      paymentStatus: invoiceData.paymentStatus,
      submittedDate: dayjs().format(),
      invoiceKey: invoiceData.id,
      date: dayjs(invoiceData.date).format(),
      typeOfSports: sport,
      ...costDetails,
      ...customerDetails,
    };
    const bookingKey = await $fetch("/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
    return bookingKey;
  };

  return {
    myBookings,
    addBooking,
    fetchMyBookings,
  };
});
