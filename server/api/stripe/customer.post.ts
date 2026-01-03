import Stripe from "stripe";

export default defineEventHandler(async (event) => {
  // localhost:3000 for testing
  const allowedOrigins = [
    "https://theark.sg",
    "https://www.theark.sg",
    "http://localhost:3000",
    "https://web-theark-multisports.vercel.app",
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
  const { name, email, phone } = await readBody(event);
  const config = useRuntimeConfig(event);
  const stripe = new Stripe(config.stripeServerKey);
  const customer = await stripe.customers.create({
    name,
    email,
    phone,
  });
  return customer;
});
