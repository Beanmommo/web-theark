import { getAuth } from "firebase-admin/auth";

type FirebaseAuthError = {
  errorInfo: {
    code: string,
    message: string
  }
}

export default defineEventHandler(async (event) =>
{
  const { uid, data } = await readBody(event);
  try
  {
    const result = await getAuth().updateUser(uid, { ...data })
    return { user: result };
  } catch (error)
  {
    console.log('Error', error);
    return createError({
      statusCode: 401,
      message: (error as FirebaseAuthError).errorInfo.code,
    });
  }
});
