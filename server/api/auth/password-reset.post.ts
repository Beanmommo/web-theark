import { getAuth } from "firebase-admin/auth";
import { db } from "~/server/utils/firebase";

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event);

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email is required",
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid email format",
    });
  }

  try {
    // First, verify the user exists
    const userRecord = await getAuth().getUserByEmail(email);

    // Check if user has email/password authentication
    const hasPasswordAuth = userRecord.providerData.some(
      (provider) => provider.providerId === "password"
    );

    if (!hasPasswordAuth) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Password reset is only available for users who signed up with email and password.",
      });
    }

    // Generate password reset link using Firebase Admin SDK
    const resetLink = await getAuth().generatePasswordResetLink(email);

    // Write to Firebase Realtime Database to trigger the Cloud Function
    // The Cloud Function will send the branded email
    const ref = db.ref("/passwordReset");
    await ref.push({
      email: email,
      url: resetLink,
    });

    return {
      success: true,
      message: "Password reset email will be sent shortly",
    };
  } catch (error: any) {
    console.error("Error sending password reset:", error);

    if (error.code === "auth/user-not-found") {
      throw createError({
        statusCode: 404,
        statusMessage: "No account found with this email address",
      });
    }

    if (error.statusCode) {
      throw error; // Re-throw our custom errors
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send password reset email",
    });
  }
});

