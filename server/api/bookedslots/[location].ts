import { db, fs } from "../../utils/firebase";
import type { BookedSlotData, BookedSlot } from "~/types/data";

export default defineEventHandler(async (event) => {
  const location = getRouterParam(event, "location");
  if (!location) return {};
  const decodedLocation = decodeURI(location);

  // Fetch from Realtime Database
  const ref = db.ref("/bookedSlots");
  const rtdbData = await new Promise<BookedSlotData>((resolve, _) =>
    ref
      .orderByChild("location")
      .equalTo(decodedLocation)
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
    const querySnapshot = await fs_ref
      .where("location", "==", decodedLocation)
      .get();

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
