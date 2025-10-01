export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) return null;

  // Try to fetch from Firestore first (primary database)
  const fsRef = fs.collection("invoices").doc(id);

  try {
    const doc = await fsRef.get();

    if (doc.exists) {
      console.log(`Found invoice ${id} in Firestore`);
      return { id: doc.id, ...doc.data() };
    }
  } catch (error) {
    console.log("Firestore read failed:", error);
  }

  // If not found in either database
  console.log(`Warning: Invoice ${id} not found in either database`);
  return null;
});
