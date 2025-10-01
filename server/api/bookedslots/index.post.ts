import { fs } from "../../utils/firebase";
import { type BookedSlot } from "../../../types/data";

export default defineEventHandler(async (event) => {
  const slots = await readBody(event);
  const fs_ref = fs.collection("bookedSlots");
  const fs_batch = fs.batch();
  const slotKeys: string[] = [];

  slots.forEach((slot: BookedSlot) => {
    const newKey = fs_ref.doc().id;
    if (!newKey) return;

    fs_batch.set(fs_ref.doc(newKey), slot);
    slotKeys.push(newKey);
  });

  await fs_batch.commit();
  console.log(`Created ${slotKeys.length} booked slots in Firestore`);

  return slotKeys;
});
