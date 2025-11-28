import { fs } from "../../utils/firebase";

/**
 * POST /api/packageAllocations
 * Create a new package allocation in Firestore
 * Firestore will auto-generate the ID
 */
export default defineEventHandler(async (event) => {
  try {
    const allocation = await readBody(event);

    // Save to Firestore packageAllocations collection
    // Firestore auto-generates the ID
    const ref = fs.collection("packageAllocations");
    const docRef = await ref.add(allocation);

    console.log(`Created package allocation ${docRef.id} in Firestore`);

    return docRef.id;
  } catch (error) {
    console.error("Error creating package allocation:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to create package allocation",
    });
  }
});

