import axios from "axios";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Check environment - only run in production
  const config = useRuntimeConfig();
  const isProduction = config.public.env === "production";

  if (!isProduction) {
    console.log(
      "🔧 [DEV] Skipping automate create - not in production environment"
    );
    console.log("🔧 [DEV] Would have created automate slot:", body);
    return { success: true, environment: "dev" }; // Return success to not break flow
  }

  console.log("✅ [PROD] Creating automate slot:", body);

  const axiosData = {
    method: "POST",
    headers: {
      Authorization: `Basic Ym9va2luZzpUaGVhcmtzZzEyMyE=`,
      "Content-Type": "application/json",
    },
    data: body,
    url: "https://thearkautomate.et.r.appspot.com/booking/",
  };

  try {
    await axios(axiosData);
    console.log("✅ [PROD] Successfully created automate slot");
    return { success: true, environment: "prod" };
  } catch (error: any) {
    console.error("❌ [PROD] Failed to create automate slot:", error);
    // Don't throw - continue with booking even if automate create fails
    return {
      success: false,
      error: error?.message || "Unknown error",
      environment: "prod",
    };
  }
});

