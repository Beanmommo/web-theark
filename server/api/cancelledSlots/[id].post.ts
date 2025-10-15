import { fs } from "../../utils/firebase";
import type { BookedSlot } from "~/types/data";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id"); // This is the slotKey
  if (!id) return { error: "Slot ID is required" };

  const slotData = await readBody(event); // Contains the slot data + cancelledDate

  // Save to Firestore cancelledSlots collection
  try {
    await fs.collection("cancelledSlots").doc(id).set(slotData);
    console.log(`Moved slot ${id} to cancelledSlots`);
  } catch (error) {
    console.log("Firestore cancelledSlots save failed:", error);
    throw error;
  }

  return { success: true, slotKey: id };
});
