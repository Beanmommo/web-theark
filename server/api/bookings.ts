import { db, fs } from "../utils/firebase";
import type { BookingData, Booking } from "~/types/data";

export default defineEventHandler(async () => {
  // Fetch from Realtime Database
  const ref = db.ref("/bookings");
  const rtdbData = await new Promise<BookingData>((resolve, _) =>
    ref.once(
      "value",
      (snapshot) => {
        const data = snapshot.val() || {};
        resolve(data);
      },
      (errorObject) => {
        console.log("RTDB read failed: " + errorObject.name);
        resolve({});
      }
    )
  );

  // Fetch from Firestore
  const fs_ref = fs.collection("bookings");
  const firestoreData: BookingData = {};

  try {
    const querySnapshot = await fs_ref.get();

    querySnapshot.forEach((doc) => {
      firestoreData[doc.id] = doc.data() as Booking;
    });
  } catch (error) {
    console.log("Firestore read failed:", error);
  }

  // Merge both data sources
  const mergedData: BookingData = {
    ...rtdbData,
    ...firestoreData,
  };

  return mergedData;
});
