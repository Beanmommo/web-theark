import Stripe from 'stripe'


const validateRequestBody = (body: any) =>
{
  if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0)
  {
    throw createError({ statusCode: 400, message: 'Invalid amount' });
  }
  if (!body.presaleId || typeof body.presaleId !== 'string')
  {
    throw createError({ statusCode: 400, message: 'Invalid presaleId' });
  }
  if (!body.customer || typeof body.customer !== 'string')
  {
    throw createError({ statusCode: 400, message: 'Invalid customer ID' });
  }
};

export default defineEventHandler(async (event) =>
{

  const allowedOrigins = ['https://theark.sg', 'https://www.theark.sg'];
  const origin = getHeader(event, 'origin');
  if (!origin) return
  if (!allowedOrigins.includes(origin))
  {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  setResponseHeader(event, 'Access-Control-Allow-Origin', origin);
  setResponseHeader(event, 'Access-Control-Allow-Methods', 'POST, OPTIONS');
  setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (event.method === 'OPTIONS')
  {
    return null; // Handle preflight requests
  }
  // Validate the secret token
  const config = useRuntimeConfig(event)

  const body = await readBody(event)
  validateRequestBody(body);

  const stripe = new Stripe(config.stripeServerKey);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: body.amount,
    currency: 'sgd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      presaleId: body.presaleId
    },
    customer: body.customer
  });
  return paymentIntent.client_secret
})