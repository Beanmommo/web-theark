import { fs } from "../../utils/firebase";
import type { CreditTransactionData, CreditTransaction } from "~/types/data";

/**
 * GET /api/creditTransactions/:userKey
 * Fetch all credit transactions for a specific user
 */
export default defineEventHandler(async (event) => {
  const userKey = getRouterParam(event, "userKey");
  if (!userKey) return {};

  try {
    const ref = fs.collection("creditTransactions");
    const snapshot = await ref.where("userKey", "==", userKey).get();
    
    const transactions: CreditTransactionData = {};
    snapshot.forEach((doc) => {
      transactions[doc.id] = doc.data() as CreditTransaction;
    });
    
    console.log(`Fetched ${Object.keys(transactions).length} credit transactions for user ${userKey}`);
    
    return transactions;
  } catch (error) {
    console.error("Error fetching credit transactions:", error);
    return {};
  }
});

