import { fs } from "../../utils/firebase";

export default defineEventHandler(async (event) => {
  const creditPackage = await readBody(event);

  // Save to Firestore only (new credit packages)
  const fs_ref = fs.collection("creditPackages");
  const id = fs_ref.doc().id;
  await fs_ref.doc(id).set(creditPackage);

  console.log(`Created credit package ${id} in Firestore`);

  return id;
});
