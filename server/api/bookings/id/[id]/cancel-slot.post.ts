import { db, fs } from "../../../../utils/firebase";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { Booking, BookedSlot } from "~/types/data";

dayjs.extend(customParseFormat);

/**
 * POST /api/bookings/id/:id/cancel-slot
 * Cancel a single slot from a booking (partial cancellation)
 * 
 * Enforces 72-hour rule for customers (unless isAdmin=true)
 * 
 * Request body:
 * - slotKey: string - The key of the slot to cancel
 * - isAdmin?: boolean - If true, skip 72-hour validation
 * 
 * Response:
 * - For partial cancellation: { success: true, isLastSlot: false, slot, booking }
 * - For last slot: { success: true, isLastSlot: true, slot, booking }
 * - For 72-hour violation: { error: "Cannot delete slots within 72 hours..." }
 */
export default defineEventHandler(async (event) => {
  const bookingId = getRouterParam(event, "id");
  if (!bookingId) {
    return { error: "Booking ID is required" };
  }

  const { slotKey, isAdmin = false } = await readBody(event);

  if (!slotKey) {
    return { error: "Slot key is required" };
  }

  try {
    // Fetch booking - try Firestore first, then RTDB
    let booking: (Booking & { key?: string }) | null = null;
    let bookingSource: "firestore" | "rtdb" = "firestore";

    // Try Firestore
    const fsBookingRef = fs.collection("bookings").doc(bookingId);
    const fsBookingDoc = await fsBookingRef.get();

    if (fsBookingDoc.exists) {
      booking = { ...fsBookingDoc.data() as Booking, key: bookingId };
      bookingSource = "firestore";
    } else {
      // Try RTDB
      const rtdbBookingRef = db.ref(`bookings/${bookingId}`);
      const rtdbSnapshot = await rtdbBookingRef.once("value");

      if (rtdbSnapshot.exists()) {
        booking = { ...rtdbSnapshot.val() as Booking, key: bookingId };
        bookingSource = "rtdb";
      }
    }

    if (!booking) {
      return { error: "Booking not found" };
    }

    // Validate slot belongs to booking
    if (!booking.slots || !booking.slots.includes(slotKey)) {
      return { error: "Slot does not belong to this booking" };
    }

    // Fetch slot data - try Firestore first, then RTDB
    let slot: (BookedSlot & { key?: string }) | null = null;
    let slotSource: "firestore" | "rtdb" = "firestore";

    // Try Firestore
    const fsSlotRef = fs.collection("bookedSlots").doc(slotKey);
    const fsSlotDoc = await fsSlotRef.get();

    if (fsSlotDoc.exists) {
      slot = { ...fsSlotDoc.data() as BookedSlot, key: slotKey };
      slotSource = "firestore";
    } else {
      // Try RTDB
      const rtdbSlotRef = db.ref(`bookedSlots/${slotKey}`);
      const rtdbSnapshot = await rtdbSlotRef.once("value");

      if (rtdbSnapshot.exists()) {
        slot = { ...rtdbSnapshot.val() as BookedSlot, key: slotKey };
        slotSource = "rtdb";
      }
    }

    if (!slot) {
      return { error: "Slot not found" };
    }

    // 72-hour validation (skip for admins)
    if (!isAdmin) {
      // Parse slot date and start time
      // Slot date is "YYYY-MM-DD", start is like "9am" or "10:00am"
      const slotDateTime = dayjs(
        `${slot.date} ${slot.start}`,
        ["YYYY-MM-DD ha", "YYYY-MM-DD h:mma", "YYYY-MM-DD HH:mm"],
        true
      );

      if (!slotDateTime.isValid()) {
        console.warn(`Could not parse slot datetime: ${slot.date} ${slot.start}`);
        // Fall back to just the date
        const slotDate = dayjs(slot.date);
        const now = dayjs();
        const hoursUntil = slotDate.diff(now, "hour");

        if (hoursUntil < 72) {
          return {
            error: `Cannot delete slots within 72 hours of booking time. This slot is in ${hoursUntil} hours.`,
          };
        }
      } else {
        const now = dayjs();
        const hoursUntil = slotDateTime.diff(now, "hour");

        if (hoursUntil < 72) {
          return {
            error: `Cannot delete slots within 72 hours of booking time. This slot is in ${hoursUntil} hours.`,
          };
        }
      }
    }

    // Check if this is the last slot
    const isLastSlot = booking.slots.length === 1;

    // Return data for client-side processing
    return {
      success: true,
      isLastSlot,
      slot,
      booking,
      slotSource,
      bookingSource,
    };
  } catch (error) {
    console.error("Error in cancel-slot endpoint:", error);
    return { error: "Failed to process slot cancellation" };
  }
});

