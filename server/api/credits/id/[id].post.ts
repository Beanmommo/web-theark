import { db, fs } from "../../../utils/firebase";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) return { error: "ID is required" };

  const data = await readBody(event);

  // Try to update in Firestore first (primary database)
  const fsRef = fs.collection("creditPackages").doc(id);

  try {
    const doc = await fsRef.get();

    if (doc.exists) {
      await fsRef.update(data);
      console.log(`Updated credit package ${id} in Firestore`);
      return { success: true, database: "firestore", id, ...data };
    }
  } catch (error) {
    console.log("Firestore update failed:", error);
  }

  // If not found in Firestore, try Realtime Database
  const rtdbRef = db.ref("creditPackages/" + id);

  try {
    const snapshot = await rtdbRef.once("value");

    if (snapshot.exists()) {
      await rtdbRef.update(data);
      console.log(`Updated credit package ${id} in RTDB`);
      return { success: true, database: "rtdb", id, ...data };
    }
  } catch (error) {
    console.log("RTDB update failed:", error);
  }

  // If not found in either database
  console.log(`Warning: Credit package ${id} not found in either database`);
  return { success: false, error: "Credit package not found", id, ...data };
});
