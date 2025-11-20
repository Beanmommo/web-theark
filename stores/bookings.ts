import { defineStore } from "pinia";
import type {
  Booking,
  Invoice,
  CreditReceipt,
  BookingData,
  CancelledBooking,
  BookedSlot,
  PackageDetails,
} from "@/types/data";
import { PaymentMethods } from "@/types/data";
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
    invoiceData: Invoice & { creditReceiptKey?: string },
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
      // Only set invoiceKey for invoice-paid bookings, creditReceiptKey for credit-paid bookings
      ...(invoiceData.creditReceiptKey
        ? { creditReceiptKey: invoiceData.creditReceiptKey }
        : { invoiceKey: invoiceData.id }),
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
      const slotsData: BookedSlot[] = [];
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

          // Store slot data for automate deletion
          slotsData.push({ ...slotData, key: slotKey });

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
      // 4.5. DELETE AUTOMATE SLOTS
      // ============================================
      const bookedSlotsStore = useBookedSlotsStore();

      await bookedSlotsStore.deleteAutomateSlots(slotsData);
      console.log(`Deleted ${slotsData.length} automate slots`);

      // ============================================
      // 5. DELETE ORIGINAL BOOKING
      // ============================================
      await $fetch(`/api/bookings/id/${bookingKey}`, {
        method: "DELETE" as any,
      });

      console.log(`Deleted original booking ${bookingKey}`);

      // ============================================
      // 6. UPDATE ORIGINAL INVOICE TO REFUND
      // ============================================
      const creditsStore = useCreditsStore();
      const refundAmount = booking.subtotal - booking.discount;



      // ============================================
      // 7. CREATE CREDIT REFUND (LINKED TO ORIGINAL INVOICE OR CREDIT RECEIPT)
      // ============================================

      // Create package details for the refund
      const invoicesStore = useInvoicesStore();
      const refundPackage: PackageDetails = {
        title: `Refund - ${booking.location}`,
        amount: refundAmount.toString(),
        value: refundAmount.toString(),
        expiryPeriod: 1, // 1 MONTH expiry for refunds
        type: "Refund",
        unit: "month",
        id: `refund-${bookingKey}`,
        typeOfSports: booking.typeOfSports,
      };

      // Check payment method to determine whether to fetch invoice or credit receipt
      let originalPaymentData: Invoice | CreditReceipt | Booking;

      if (booking.paymentMethod === PaymentMethods.MEMBERSHIP_CREDIT) {
        // For credit-paid bookings, try to use creditReceiptKey if available
        if (booking.creditReceiptKey) {
          // New bookings with creditReceiptKey - fetch the credit receipt
          const originalCreditReceipt = await creditsStore.fetchCreditReceiptByKey(
            booking.creditReceiptKey
          );
          if (!originalCreditReceipt) {
            throw new Error(`Credit receipt ${booking.creditReceiptKey} not found`);
          }
          originalPaymentData = originalCreditReceipt;
          console.log(`Fetched credit receipt ${booking.creditReceiptKey} for refund`);
        } else {
          // Old bookings without creditReceiptKey - use booking data directly
          // The booking object already has all customer details and payment info we need
          originalPaymentData = booking;
          console.log(`Using booking data directly for old credit-paid booking ${bookingKey}`);
        }
      } else {
        // For invoice-paid bookings (PayNow or Credit Card), use invoiceKey
        if (!booking.invoiceKey) {
          throw new Error(`Booking ${bookingKey} does not have an associated invoice`);
        }
        // Fetch the original invoice
        const originalInvoice = await invoicesStore.fetchInvoiceByKey(
          booking.invoiceKey
        );
        if (!originalInvoice) {
          throw new Error(`Invoice ${booking.invoiceKey} not found`);
        }
        originalPaymentData = originalInvoice;
        console.log(`Fetched invoice ${booking.invoiceKey} for refund`);
      }

      // Create credit refund linked to original invoice or credit receipt
      const creditRefundKey = await creditsStore.addCreditRefund(
        originalPaymentData,
        refundPackage,
        bookingKey
      );

      console.log(`Created credit refund: ${creditRefundKey}`);

      // ============================================
      // 8. LINK ORIGINAL INVOICE TO CREDIT REFUND (ONLY FOR INVOICES)
      // ============================================
      // Note: Credit receipts don't need to be updated with refund keys
      if (creditRefundKey && booking.paymentMethod !== PaymentMethods.MEMBERSHIP_CREDIT && booking.invoiceKey) {
        await invoicesStore.updateInvoiceCreditRefundKey(
          booking.invoiceKey,
          creditRefundKey,
          bookingKey
        );
        console.log(
          `Linked invoice ${booking.invoiceKey} to credit refund ${creditRefundKey}`
        );
      }

      // ============================================
      // 9. RETURN SUCCESS
      // ============================================
      return {
        success: true,
        bookingKey,
        refundAmount,
        invoiceKey: booking.invoiceKey,
        creditRefundKey,
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
