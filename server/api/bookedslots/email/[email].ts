import { db, fs } from "../../../utils/firebase";
import type { BookedSlotData, BookedSlot } from "~/types/data";

export default defineEventHandler(async (event) => {
  const email = getRouterParam(event, "email");
  if (!email) return {};

  // Fetch from Realtime Database
  const ref = db.ref("bookedSlots");
  const rtdbData = await new Promise<BookedSlotData>((resolve, _) =>
    ref
      .orderByChild("email")
      .equalTo(email)
      .once(
        "value",
        (snapshot) => {
          const bookedSlots: BookedSlotData = snapshot.val() || {};
          resolve(bookedSlots);
        },
        (errorObject) => {
          console.log("RTDB read failed: " + errorObject.name);
          resolve({});
        }
      )
  );

  // Fetch from Firestore
  const fs_ref = fs.collection("bookedSlots");
  const firestoreData: BookedSlotData = {};

  try {
    const querySnapshot = await fs_ref.where("email", "==", email).get();

    querySnapshot.forEach((doc) => {
      firestoreData[doc.id] = doc.data() as BookedSlot;
    });
  } catch (error) {
    console.log("Firestore read failed:", error);
  }

  // Merge both data sources
  const mergedData: BookedSlotData = {
    ...rtdbData,
    ...firestoreData,
  };

  return mergedData;
});
