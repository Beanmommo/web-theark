import { fs } from "../../utils/firebase";

export default defineEventHandler(async (event) => {
  const booking = await readBody(event);
  const fs_ref = fs.collection("bookings");
  const id = fs_ref.doc().id;
  await fs_ref.doc(id).set(booking);
  return id;
});
