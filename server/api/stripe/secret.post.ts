import Stripe from "stripe";

const validateRequestBody = (body: any) => {
  if (!body.amount || typeof body.amount !== "number" || body.amount <= 0) {
    throw createError({ statusCode: 400, message: "Invalid amount" });
  }
  if (!body.presaleId || typeof body.presaleId !== "string") {
    throw createError({ statusCode: 400, message: "Invalid presaleId" });
  }
  if (!body.customer || typeof body.customer !== "string") {
    throw createError({ statusCode: 400, message: "Invalid customer ID" });
  }
  if (body.databaseVersion && typeof body.databaseVersion !== "string") {
    throw createError({ statusCode: 400, message: "Invalid databaseVersion" });
  }
  if (body.databaseVersion && !["rtdb", "firestore"].includes(body.databaseVersion)) {
    throw createError({ statusCode: 400, message: "databaseVersion must be 'rtdb' or 'firestore'" });
  }
};

export default defineEventHandler(async (event) => {
  // localhost:3000 for testing
  const allowedOrigins = [
    "https://theark.sg",
    "https://www.theark.sg",
    "http://localhost:3000",
  ];
  const origin = getHeader(event, "origin");
  if (!origin) return;
  if (!allowedOrigins.includes(origin)) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  setResponseHeader(event, "Access-Control-Allow-Origin", origin);
  setResponseHeader(event, "Access-Control-Allow-Methods", "POST, OPTIONS");
  setResponseHeader(
    event,
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (event.method === "OPTIONS") {
    return null; // Handle preflight requests
  }
  // Validate the secret token
  const config = useRuntimeConfig(event);

  const body = await readBody(event);
  validateRequestBody(body);

  const stripe = new Stripe(config.stripeServerKey);
  const metadata: Record<string, string> = {
    presaleId: body.presaleId,
  };

  // Include databaseVersion in metadata if provided
  if (body.databaseVersion) {
    metadata.databaseVersion = body.databaseVersion;
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: body.amount,
    currency: "sgd",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
    customer: body.customer,
  });
  return paymentIntent.client_secret;
});
