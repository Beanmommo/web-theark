import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type {
  Booking,
  BookedSlot,
  PartialCancellation,
  CreditRefund,
} from "~/types/data";

dayjs.extend(customParseFormat);

export type CancelSlotResult = {
  success: boolean;
  isLastSlot: boolean;
  refundAmount?: number;
  creditRefundKey?: string;
  message?: string;
  error?: string;
};

/**
 * Composable for handling partial slot cancellation
 * Allows deleting individual slots from a booking with credit refund
 */
export const usePartialCancellation = () => {
  const bookedSlotsStore = useBookedSlotsStore();
  const bookingsStore = useBookingsStore();

  /**
   * Check if a slot can be deleted (72+ hours before slot time)
   * @param slot - The slot to check
   * @returns Object with canDelete status and reason if not deletable
   */
  const canDeleteSlot = (
    slot: BookedSlot
  ): { canDelete: boolean; hoursUntil: number; reason?: string } => {
    // Parse slot date and start time
    const slotDateTime = dayjs(
      `${slot.date} ${slot.start}`,
      ["YYYY-MM-DD ha", "YYYY-MM-DD h:mma", "YYYY-MM-DD HH:mm"],
      true
    );

    let hoursUntil: number;

    if (!slotDateTime.isValid()) {
      // Fall back to just the date at midnight
      const slotDate = dayjs(slot.date);
      hoursUntil = slotDate.diff(dayjs(), "hour");
    } else {
      hoursUntil = slotDateTime.diff(dayjs(), "hour");
    }

    if (hoursUntil < 72) {
      return {
        canDelete: false,
        hoursUntil,
        reason: `Cannot delete slots within 72 hours of booking time. This slot is in ${hoursUntil} hours.`,
      };
    }

    return { canDelete: true, hoursUntil };
  };

  /**
   * Cancel a single slot from a booking
   * @param bookingKey - The booking key
   * @param slotKey - The slot key to cancel
   * @param cancelledBy - Email of who cancelled (usually "customer")
   * @param isAdmin - If true, skip 72-hour validation
   */
  const cancelSlot = async (
    bookingKey: string,
    slotKey: string,
    cancelledBy: string = "customer",
    isAdmin: boolean = false
  ): Promise<CancelSlotResult> => {
    try {
      // 1. Call API to validate and get slot/booking data
      const response = await $fetch<any>(
        `/api/bookings/id/${bookingKey}/cancel-slot`,
        {
          method: "POST",
          body: { slotKey, isAdmin },
        }
      );

      if (response.error) {
        return { success: false, isLastSlot: false, error: response.error };
      }

      const { slot, booking, isLastSlot, slotSource, bookingSource } = response;

      // 2. If this is the last slot, trigger full cancellation
      if (isLastSlot) {
        await bookingsStore.cancelBooking(bookingKey);
        return {
          success: true,
          isLastSlot: true,
          message: "Last slot deleted. Full booking cancellation processed.",
        };
      }

      // 3. Process partial cancellation
      const refundAmount = slot.rate || 0;
      const timestamp = new Date().toISOString();

      // 3a. Delete from Automate system
      await bookedSlotsStore.deleteAutomateSlots([{ ...slot, key: slotKey }]);

      // 3b. Move slot to cancelledSlots collection (Firestore)
      await $fetch(`/api/cancelledSlots/${slotKey}`, {
        method: "POST",
        body: {
          ...slot,
          cancelledDate: timestamp,
          cancelledBy,
        },
      });

      // 3c. Delete from bookedSlots
      await $fetch(`/api/bookedslots/id/${slotKey}`, {
        method: "DELETE",
      });

      // 3d. Create credit refund
      const creditRefund = await createCreditRefund(
        booking,
        slot,
        refundAmount,
        cancelledBy,
        timestamp
      );

      // 3e. Update booking document
      await updateBookingForPartialCancellation(
        bookingKey,
        slotKey,
        refundAmount,
        cancelledBy,
        timestamp,
        creditRefund.key,
        booking,
        bookingSource
      );

      // 3f. Record in credit ledger
      await recordPartialRefundTransaction(
        booking,
        refundAmount,
        creditRefund.key,
        slotKey
      );

      return {
        success: true,
        isLastSlot: false,
        refundAmount,
        creditRefundKey: creditRefund.key,
        message: `Slot deleted. $${refundAmount} credited to your account.`,
      };
    } catch (error: any) {
      console.error("Error in cancelSlot:", error);
      return {
        success: false,
        isLastSlot: false,
        error: error.message || "Failed to cancel slot",
      };
    }
  };

  /**
   * Create a credit refund for the cancelled slot
   */
  const createCreditRefund = async (
    booking: Booking,
    slot: BookedSlot,
    refundAmount: number,
    cancelledBy: string,
    timestamp: string
  ): Promise<{ key: string }> => {
    const expiryDate = dayjs().add(1, "month").toISOString();

    const creditRefund: Omit<CreditRefund, "key"> = {
      name: booking.name,
      contact: booking.contact,
      email: booking.email,
      userKey: booking.userId,
      amount: String(refundAmount),
      value: String(refundAmount),
      creditsLeft: refundAmount,
      expiryDate,
      paymentMethod: "Refund",
      paymentStatus: "Paid",
      submittedDate: timestamp,
      originalBookingKey: booking.key,
      cancelledDate: timestamp,
      cancelledBy,
      creditPackage: {
        title: "Partial Cancellation Refund",
        amount: String(refundAmount),
        value: String(refundAmount),
        type: "refund",
        expiryPeriod: 1,
        unit: "month",
      },
    };

    const creditRefundKey = await $fetch<string>("/api/creditRefunds", {
      method: "POST",
      body: creditRefund,
    });

    return { key: creditRefundKey };
  };

  /**
   * Update booking document with partial cancellation data
   */
  const updateBookingForPartialCancellation = async (
    bookingKey: string,
    slotKey: string,
    refundAmount: number,
    cancelledBy: string,
    timestamp: string,
    creditRefundKey: string,
    booking: Booking,
    bookingSource: "firestore" | "rtdb"
  ): Promise<void> => {
    const partialCancellation: PartialCancellation = {
      slotKey,
      slotRate: refundAmount,
      cancelledDate: timestamp,
      cancelledBy,
      creditRefundKey,
    };

    // Update slots array (remove cancelled slot)
    const updatedSlots = (booking.slots || []).filter((s) => s !== slotKey);

    // Build update data
    const updateData = {
      slots: updatedSlots,
      cancelledSlots: [...(booking.cancelledSlots || []), slotKey],
      refundAmount: (booking.refundAmount || 0) + refundAmount,
      partialCancellations: [
        ...(booking.partialCancellations || []),
        partialCancellation,
      ],
    };

    // Use appropriate API based on source
    if (bookingSource === "firestore") {
      await $fetch(`/api/bookings/id/${bookingKey}`, {
        method: "POST",
        body: updateData,
      });
    } else {
      // RTDB update
      await $fetch(`/api/bookings/id/${bookingKey}`, {
        method: "POST",
        body: updateData,
      });
    }
  };

  /**
   * Record partial refund transaction in credit ledger
   */
  const recordPartialRefundTransaction = async (
    booking: Booking,
    refundAmount: number,
    creditRefundKey: string,
    slotKey: string
  ): Promise<void> => {
    const creditLedger = useCreditLedger();

    // Get current balance
    const currentBalance = await creditLedger.getCurrentBalance(booking.userId);
    const newBalance = currentBalance + refundAmount;

    const transaction = {
      userKey: booking.userId,
      email: booking.email,
      name: booking.name,
      contact: booking.contact,
      type: "PARTIAL_REFUND" as const,
      timestamp: new Date().toISOString(),
      amount: refundAmount,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      bookingKey: booking.key,
      packageKey: creditRefundKey,
      slotKeys: [slotKey],
      description: `Partial refund for slot cancellation - $${refundAmount}`,
    };

    await $fetch("/api/creditTransactions", {
      method: "POST",
      body: transaction,
    });
  };

  return {
    canDeleteSlot,
    cancelSlot,
  };
};
