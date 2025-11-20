import axios from "axios";

export default defineEventHandler(async (event) => {
  const { bookedSlotsKey } = await readBody(event);

  if (!bookedSlotsKey) {
    return { error: "bookedSlotsKey is required" };
  }

  // Check environment - only run in production
  const config = useRuntimeConfig();
  const isProduction = config.public.env === "production";

  if (!isProduction) {
    console.log(
      "🔧 [DEV] Skipping automate delete - not in production environment"
    );
    console.log("🔧 [DEV] Would have deleted automate slot:", bookedSlotsKey);
    return { success: true, bookedSlotsKey, environment: "dev" }; // Return success to not break flow
  }

  console.log("✅ [PROD] Deleting automate slot:", bookedSlotsKey);

  try {
    const axiosData = {
      method: "delete",
      headers: {
        Authorization: `Basic Ym9va2luZzpUaGVhcmtzZzEyMyE=`,
      },
      url: `https://thearkautomate.et.r.appspot.com/booking/${bookedSlotsKey}`,
    };
    console.log("axiosData:", axiosData);
    await axios(axiosData);
    console.log(
      `✅ [PROD] Successfully deleted automate slot: ${bookedSlotsKey}`
    );
    return { success: true, bookedSlotsKey, environment: "prod" };
  } catch (error: any) {
    console.error(
      `❌ [PROD] Failed to delete automate slot ${bookedSlotsKey}:`,
      error
    );
    // Don't throw - continue with cancellation even if automate delete fails
    return {
      success: false,
      error: error?.message || "Unknown error",
      bookedSlotsKey,
      environment: "prod",
    };
  }
});

