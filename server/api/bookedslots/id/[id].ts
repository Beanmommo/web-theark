import { db, fs } from "../../../utils/firebase";
import type { BookedSlot } from "~/types/data";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) return null;

  // Try to fetch from Firestore first (primary database)
  const fsRef = fs.collection("bookedSlots").doc(id);

  try {
    const doc = await fsRef.get();

    if (doc.exists) {
      console.log(`Found slot ${id} in Firestore`);
      return { id: doc.id, ...doc.data() } as BookedSlot;
    }
  } catch (error) {
    console.log("Firestore read failed:", error);
  }

  // If not found in Firestore, try Realtime Database
  const rtdbRef = db.ref("bookedSlots/" + id);

  try {
    const snapshot = await rtdbRef.once("value");

    if (snapshot.exists()) {
      console.log(`Found slot ${id} in RTDB`);
      return { key: id, ...snapshot.val() } as BookedSlot;
    }
  } catch (error) {
    console.log("RTDB read failed:", error);
  }

  // If not found in either database
  console.log(`Warning: Slot ${id} not found in either database`);
  return null;
});

