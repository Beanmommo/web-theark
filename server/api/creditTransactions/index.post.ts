import { fs } from "../../utils/firebase";

/**
 * POST /api/creditTransactions
 * Create a new credit transaction in Firestore
 * Firestore will auto-generate the ID
 */
export default defineEventHandler(async (event) => {
  try {
    const transaction = await readBody(event);

    // Save to Firestore creditTransactions collection
    // Firestore auto-generates the ID
    const ref = fs.collection("creditTransactions");
    const docRef = await ref.add(transaction);

    console.log(`Created credit transaction ${docRef.id} in Firestore`);

    return docRef.id;
  } catch (error) {
    console.error("Error creating credit transaction:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to create credit transaction",
    });
  }
});

