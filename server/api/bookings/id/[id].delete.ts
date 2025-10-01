import { db, fs } from "../../../utils/firebase";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) return { error: "ID is required" };

  // Try to delete from Firestore first (primary database)
  const fsRef = fs.collection("bookings").doc(id);

  try {
    const doc = await fsRef.get();

    if (doc.exists) {
      await fsRef.delete();
      console.log(`Deleted booking ${id} from Firestore`);
      return { success: true, database: "firestore", id };
    }
  } catch (error) {
    console.log("Firestore delete failed:", error);
  }

  // If not found in Firestore, try Realtime Database
  const rtdbRef = db.ref("bookings/" + id);

  try {
    const snapshot = await rtdbRef.once("value");

    if (snapshot.exists()) {
      await rtdbRef.remove();
      console.log(`Deleted booking ${id} from RTDB`);
      return { success: true, database: "rtdb", id };
    }
  } catch (error) {
    console.log("RTDB delete failed:", error);
  }

  // If not found in either database
  console.log(`Warning: Booking ${id} not found in either database`);
  return { success: false, error: "Booking not found", id };
});

