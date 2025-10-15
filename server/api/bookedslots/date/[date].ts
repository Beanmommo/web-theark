import { db, fs } from "../../../utils/firebase";
import type { BookedSlotData, BookedSlot } from "~/types/data";

export default defineEventHandler(async (event) => {
  const date = getRouterParam(event, "date");
  if (!date) return {};

  // Create start and end date for the given date (full day)
  const startDate = `${date}`;
  const endDate = `${date}T23:59:59+23:00`;

  // Fetch from Realtime Database
  const ref = db.ref("/bookedSlots");
  const rtdbData = await new Promise<BookedSlotData>((resolve, _) =>
    ref
      .orderByChild("date")
      .startAt(startDate)
      .endAt(endDate)
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
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
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

  // Normalize typeOfSports for all slots
  const normalizedData: BookedSlotData = {};
  Object.keys(mergedData).forEach(key => {
    const slot = mergedData[key];
    normalizedData[key] = {
      ...slot,
      typeOfSports: slot.typeOfSports?.toLowerCase() || 'futsal'
    };
  });

  return normalizedData;
});
