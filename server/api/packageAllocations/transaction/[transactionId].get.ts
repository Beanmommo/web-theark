import { fs } from "../../../utils/firebase";
import type { PackageAllocationData, PackageAllocation } from "~/types/data";

/**
 * GET /api/packageAllocations/transaction/:transactionId
 * Fetch all package allocations for a specific transaction
 */
export default defineEventHandler(async (event) => {
  const transactionId = getRouterParam(event, "transactionId");
  if (!transactionId) return {};

  try {
    const ref = fs.collection("packageAllocations");
    const snapshot = await ref.where("transactionId", "==", transactionId).get();
    
    const allocations: PackageAllocationData = {};
    snapshot.forEach((doc) => {
      allocations[doc.id] = doc.data() as PackageAllocation;
    });
    
    console.log(`Fetched ${Object.keys(allocations).length} package allocations for transaction ${transactionId}`);
    
    return allocations;
  } catch (error) {
    console.error("Error fetching package allocations:", error);
    return {};
  }
});

