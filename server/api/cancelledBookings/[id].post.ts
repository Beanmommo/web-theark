import { db, fs } from "../../utils/firebase";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id"); // This is the bookingKey
  if (!id) return { error: "Booking ID is required" };

  const cancelledBookingData = await readBody(event); // Contains booking + cancellation metadata

  // Save to Firestore cancelledBookings collection
  try {
    await fs.collection("cancelledBookings").doc(id).set(cancelledBookingData);
    console.log(`Moved booking ${id} to cancelledBookings in Firestore`);
  } catch (error) {
    console.log("Firestore cancelledBookings save failed:", error);
  }

  // Save to RTDB cancelledBookings
  try {
    await db.ref(`cancelledBookings/${id}`).set(cancelledBookingData);
    console.log(`Moved booking ${id} to cancelledBookings in RTDB`);
  } catch (error) {
    console.log("RTDB cancelledBookings save failed:", error);
  }

  return { success: true, bookingKey: id };
});
