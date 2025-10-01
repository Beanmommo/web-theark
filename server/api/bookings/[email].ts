import { db, fs } from "../../utils/firebase";
import type { BookingData, Booking } from "~/types/data";

export default defineEventHandler(async (event) => {
  const email = getRouterParam(event, "email");
  if (!email) return {};

  // Fetch from Realtime Database
  const ref = db.ref("bookings");
  const rtdbData = await new Promise<BookingData>((resolve, _) =>
    ref
      .orderByChild("email")
      .equalTo(email)
      .once(
        "value",
        (snapshot) => {
          const bookings: BookingData = snapshot.val() || {};
          resolve(bookings);
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
    const querySnapshot = await fs_ref.where("email", "==", email).get();

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
