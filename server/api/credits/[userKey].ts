import { db, fs } from "../../utils/firebase";
import type { CreditPackageData, CreditPackage } from "~/types/data";

export default defineEventHandler(async (event) => {
  const userKey = getRouterParam(event, "userKey");
  if (!userKey) return {};

  // Fetch from Realtime Database (legacy data)
  const ref = db.ref("creditPackages");
  const rtdbData = await new Promise<CreditPackageData>((resolve, _) =>
    ref
      .orderByChild("userKey")
      .equalTo(userKey)
      .once(
        "value",
        (snapshot) => {
          const creditPackages: CreditPackageData = snapshot.val() || {};
          resolve(creditPackages);
        },
        (errorObject) => {
          console.log("RTDB read failed: " + errorObject.name);
          resolve({});
        }
      )
  );

  // Fetch from Firestore (new data)
  const fs_ref = fs.collection("creditPackages");
  const firestoreData: CreditPackageData = {};

  try {
    const querySnapshot = await fs_ref.where("userKey", "==", userKey).get();

    querySnapshot.forEach((doc) => {
      firestoreData[doc.id] = doc.data() as CreditPackage;
    });

    console.log(
      `Fetched ${
        Object.keys(firestoreData).length
      } credit packages from Firestore for user ${userKey}`
    );
  } catch (error) {
    console.log("Firestore read failed:", error);
  }

  // Merge both data sources (Firestore takes precedence)
  const mergedData: CreditPackageData = {
    ...rtdbData,
    ...firestoreData,
  };

  console.log(
    `Total credit packages for user ${userKey}: ${
      Object.keys(mergedData).length
    }`
  );

  return mergedData;
});
