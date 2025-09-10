import { getAuth } from "firebase-admin/auth";


export default defineEventHandler(async (event) =>
{

  const config = useRuntimeConfig();
  const { firebaseIdToken } = await readBody(event);

  try
  {
    if (!firebaseIdToken)
    {
      throw createError({ statusCode: 400, message: "Token missing" });
    }
    // Set session cookie expiration (e.g., 5 days)
    const expiresIn = config.public.authCookieExpires;
    // Create a session cookie
    const sessionCookie = await getAuth().createSessionCookie(firebaseIdToken, { expiresIn });

    // Set the session cookie in the response
    setCookie(event, config.public.authCookieName, sessionCookie, {
      maxAge: config.public.authCookieExpires,
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    const token = await getAuth().verifySessionCookie(sessionCookie, true);
    const user = await getAuth().getUser(token.uid);
    // Optionally set custom claims if needed
    if (!user.customClaims?.admin)
    {
      await getAuth().setCustomUserClaims(token.uid, {
        admin: true,
        username: "admin",
      });
    }

    return { user };

  } catch (error)
  {
    console.error("Authentication error:", error);

    throw createError({
      statusCode: 401,
      message: "Not authenticated",
    });
  }
});
