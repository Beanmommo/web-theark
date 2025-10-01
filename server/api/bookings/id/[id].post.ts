import { db, fs } from "../../../utils/firebase";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) return { error: "ID is required" };

  const booking = await readBody(event);

  // Try to update in Firestore first (primary database)
  const fsRef = fs.collection("bookings").doc(id);

  try {
    const doc = await fsRef.get();

    if (doc.exists) {
      await fsRef.update(booking);
      console.log(`Updated booking ${id} in Firestore`);
      return { success: true, database: "firestore", ...booking };
    }
  } catch (error) {
    console.log("Firestore update failed:", error);
  }

  // If not found in Firestore, try Realtime Database
  const rtdbRef = db.ref("bookings/" + id);

  try {
    const snapshot = await rtdbRef.once("value");

    if (snapshot.exists()) {
      await rtdbRef.update(booking);
      console.log(`Updated booking ${id} in RTDB`);
      return { success: true, database: "rtdb", ...booking };
    }
  } catch (error) {
    console.log("RTDB update failed:", error);
  }

  // If not found in either database
  console.log(`Warning: Booking ${id} not found in either database`);
  return { success: false, error: "Booking not found", ...booking };
});

