import { getAuth } from "firebase-admin/auth";

export default defineEventHandler(async (event) =>
{
  const user = await readBody(event);

  const result = await getAuth().createUser(user)
  return result.uid;

});
