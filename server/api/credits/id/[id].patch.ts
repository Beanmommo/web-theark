import { db, fs } from "../../../utils/firebase";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) return { error: "ID is required" };

  const data = await readBody(event);

  // 1. Try Firestore creditPackages first
  const fsRef = fs.collection("creditPackages").doc(id);
  
  try {
    const doc = await fsRef.get();
    
    if (doc.exists) {
      await fsRef.update(data);
      console.log(`[PATCH] Updated credit package ${id} in Firestore creditPackages`);
      return { success: true, database: "firestore-creditPackages", id, ...data };
    }
  } catch (error) {
    console.log("Firestore creditPackages update failed:", error);
  }

  // 2. Try RTDB creditPackages (legacy)
  const rtdbRef = db.ref("creditPackages/" + id);
  
  try {
    const snapshot = await rtdbRef.once("value");
    
    if (snapshot.exists()) {
      await rtdbRef.update(data);
      console.log(`[PATCH] Updated credit package ${id} in RTDB creditPackages`);
      return { success: true, database: "rtdb-creditPackages", id, ...data };
    }
  } catch (error) {
    console.log("RTDB creditPackages update failed:", error);
  }

  // 3. Not found in any database
  console.log(`[PATCH] Warning: Credit package ${id} not found in any database`);
  return { success: false, error: "Credit package not found", id, ...data };
});

