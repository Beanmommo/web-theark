import { defineStore } from "pinia";
import type {
  Booking,
  Invoice,
  BookingData,
  CancelledBooking,
  BookedSlot,
  PackageDetails,
  PaymentMethods,
  InvoiceType,
} from "@/types/data";
import { useCreditsStore } from "./credits";

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

  const cancelBooking = async (bookingKey: string) => {
    try {
      // ============================================
      // 1. FETCH THE ORIGINAL BOOKING
      // ============================================
      const booking = await $fetch<Booking>(`/api/bookings/id/${bookingKey}`);

      if (!booking) {
        throw new Error(`Booking ${bookingKey} not found`);
      }

      // ============================================
      // 2. PREPARE CANCELLED BOOKING DATA
      // ============================================
      const cancelledBookingData: CancelledBooking = {
        ...booking,
        cancelledBy: "system",
        cancelledDate: new Date().toISOString(),
        status: "cancelled",
      };

      // ============================================
      // 3. MOVE BOOKING TO CANCELLED BOOKINGS
      // ============================================
      await $fetch(`/api/cancelledBookings/${bookingKey}`, {
        method: "POST",
        body: JSON.stringify(cancelledBookingData),
      });

      console.log(`Moved booking ${bookingKey} to cancelledBookings`);

      // ============================================
      // 4. FETCH AND MOVE ALL BOOKED SLOTS
      // ============================================
      const slotPromises = booking.slots.map(async (slotKey) => {
        try {
          // Fetch the slot data
          const slotData = await $fetch<BookedSlot>(
            `/api/bookedslots/id/${slotKey}`
          );

          if (!slotData) {
            console.warn(`Slot ${slotKey} not found, skipping`);
            return;
          }

          // Add cancelledDate to slot
          const cancelledSlotData = {
            ...slotData,
            cancelledDate: new Date().toISOString(),
          };

          // Move to cancelledSlots
          await $fetch(`/api/cancelledSlots/${slotKey}`, {
            method: "POST",
            body: JSON.stringify(cancelledSlotData),
          });

          console.log(`Moved slot ${slotKey} to cancelledSlots`);

          // Delete original slot from both databases
          await $fetch(`/api/bookedslots/id/${slotKey}`, {
            method: "DELETE" as any,
          });

          console.log(`Deleted original slot ${slotKey}`);
        } catch (error) {
          console.error(`Failed to process slot ${slotKey}:`, error);
          throw error;
        }
      });

      await Promise.all(slotPromises);

      // ============================================
      // 5. DELETE ORIGINAL BOOKING
      // ============================================
      await $fetch(`/api/bookings/id/${bookingKey}`, {
        method: "DELETE" as any,
      });

      console.log(`Deleted original booking ${bookingKey}`);

      // ============================================
      // 6. CREATE REFUND CREDIT PACKAGE
      // ============================================
      const creditsStore = useCreditsStore();
      const refundAmount = booking.subtotal - booking.discount;

      // Create package details for the refund
      const refundPackage: PackageDetails = {
        title: `Refund - ${booking.location}`,
        amount: refundAmount.toString(),
        value: refundAmount.toString(),
        expiryPeriod: 6, // 6 months expiry
        type: "Refund",
        unit: "month",
        id: `refund-${bookingKey}`,
        typeOfSports: booking.typeOfSports,
      };

      // Create invoice data for the refund
      const refundInvoiceData: Partial<Invoice> = {
        name: booking.name,
        contact: booking.contact,
        email: booking.email,
        userId: booking.userId,
        paymentMethod: "Refund" as PaymentMethods,
        paymentStatus: "Paid",
        id: `refund-inv-${bookingKey}`,
        submittedDate: dayjs().format(),
        invoiceType: "Credit Package" as InvoiceType,
        location: booking.location,
        subtotal: refundAmount,
        total: refundAmount,
        gst: 0,
        gstPercentage: 0,
        totalPayable: refundAmount,
        discount: 0,
        promocode: "",
        transactionFee: 0,
        transactionPercentage: 0,
        slots: [],
      };

      // Add the credit package using existing function
      const creditPackageKey = await creditsStore.addCreditPackage(
        refundInvoiceData as Invoice,
        refundPackage
      );

      console.log(`Created refund credit package: ${creditPackageKey}`);

      // ============================================
      // 7. RETURN SUCCESS
      // ============================================
      return {
        success: true,
        bookingKey,
        refundAmount,
        creditPackageKey,
      };
    } catch (error) {
      console.error("Cancellation failed:", error);
      throw error;
    }
  };

  return {
    myBookings,
    addBooking,
    fetchMyBookings,
    cancelBooking,
  };
});
