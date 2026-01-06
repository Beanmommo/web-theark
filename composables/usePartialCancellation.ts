import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type {
  Booking,
  BookedSlot,
  PartialCancellation,
  CreditRefund,
} from "~/types/data";
import { CANCELLATION_HOURS_REQUIRED } from "~/constants/booking";

dayjs.extend(customParseFormat);

export type CancelSlotResult = {
  success: boolean;
  pending?: boolean;
  isLastSlot: boolean;
  refundAmount?: number;
  creditRefundKey?: string;
  message?: string;
  error?: string;
};

/**
 * Composable for handling partial slot cancellation
 * Submits slot cancellation requests for admin approval
 * Enforces 72-hour rule for customers
 */
export const usePartialCancellation = () => {
  const bookedSlotsStore = useBookedSlotsStore();
  const bookingsStore = useBookingsStore();

  /**
   * Check if a slot can be deleted (CANCELLATION_HOURS_REQUIRED+ hours before slot time)
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

    if (hoursUntil < CANCELLATION_HOURS_REQUIRED) {
      return {
        canDelete: false,
        hoursUntil,
        reason: `Cannot delete slots within ${CANCELLATION_HOURS_REQUIRED} hours of booking time. This slot is in ${hoursUntil} hours.`,
      };
    }

    return { canDelete: true, hoursUntil };
  };

  /**
   * Submit a slot cancellation request (pending approval workflow)
   * @param bookingKey - The booking key
   * @param slotKey - The slot key to cancel
   * @param cancelledBy - Email of who requested cancellation
   * @param cancellationReason - Reason for cancellation
   * @param otherReason - Additional details if reason is "Other"
   * @param isAdmin - If true, skip 72-hour validation
   */
  const cancelSlot = async (
    bookingKey: string,
    slotKey: string,
    cancelledBy: string,
    cancellationReason: string,
    otherReason?: string,
    isAdmin: boolean = false
  ): Promise<CancelSlotResult> => {
    try {
      // Call API to submit cancellation request
      const response = await $fetch<any>(
        `/api/bookings/id/${bookingKey}/cancel-slot`,
        {
          method: "POST",
          body: {
            slotKey,
            cancelledBy,
            cancellationReason,
            ...(otherReason && { otherReason }),
            isAdmin,
          },
        }
      );

      if (response.error) {
        return {
          success: false,
          isLastSlot: false,
          error: response.error,
        };
      }

      // Check if this is the last slot (should use full cancellation workflow)
      if (response.isLastSlot) {
        return {
          success: true,
          isLastSlot: true,
          message:
            response.message ||
            "This is the last slot. Please use full booking cancellation.",
        };
      }

      // Return success with pending status
      return {
        success: true,
        pending: true,
        isLastSlot: false,
        message:
          response.message ||
          "Slot cancellation request submitted. Pending admin approval.",
      };
    } catch (error: any) {
      console.error("Error in cancelSlot:", error);
      return {
        success: false,
        isLastSlot: false,
        error: error.message || "Failed to submit cancellation request",
      };
    }
  };

  return {
    canDeleteSlot,
    cancelSlot,
  };
};
