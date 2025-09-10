import { defineStore } from 'pinia'
import Stripe from 'stripe';
import { type CustomerDetails } from '@/types/data'

export const usePaymentsStore = defineStore('payments', () =>
{
  const config = useRuntimeConfig();
  const card = ref()
  const stripeRef = ref()
  const stripeClientSecret = ref()
  const customer = ref()

  const initialiseStripe = (stripe: object | null, cardElement: Stripe.Card) =>
  {
    card.value = cardElement
    stripeRef.value = stripe
  }

  const setupCustomer = async (customerData: Partial<CustomerDetails>) =>
  {
    const { name, email, contact} = customerData
    const stripeCustomer = await $fetch('/api/stripe/customer', {
      method: "POST", body: { name, email, phone: contact }
    })
    customer.value = stripeCustomer
  }

  const setupClientSecret = async (presaleId: string, amount: number, customer: Stripe.Customer) =>
  {
    const stripeAmount = parseInt((amount * 100).toFixed(0))
    const stripeSecret = await $fetch('/api/stripe/secret', {
      method: "POST",
      body: { amount: stripeAmount, presaleId, customer: customer.id }
    })
    if (!stripeSecret) return;
    stripeClientSecret.value = stripeSecret
  }

  const confirmCardPayment = (presaleId: string, amount: number, customerData: Partial<CustomerDetails>) =>
  {
    return new Promise<Stripe.PaymentIntent>(async (resolve, reject) =>
    {
      await setupCustomer(customerData)
      await setupClientSecret(presaleId, amount, customer.value)
      if (!stripeClientSecret.value || !stripeRef.value) return;
      stripeRef.value.confirmCardPayment(stripeClientSecret.value, {
        payment_method: {
          card: card.value,
        },
      }).then((result: { paymentIntent?: Stripe.PaymentIntent; error?: Stripe.StripeRawError }) =>
      {
        if (result.error)
        {
          // Handle payment error (e.g., display error message to user)
          console.error("Payment error:", result.error.message);
          reject(result.error);
        } else if (result.paymentIntent)
        {
          // Payment successful, resolve with the payment intent
          resolve(result.paymentIntent);
        } else
        {
          // Handle unexpected response structure
          console.error("Unexpected response from confirmCardPayment");
          reject(new Error("Unexpected response from confirmCardPayment"));
        }
      })
        .catch((error: Error) =>
        {
          // Catch any other errors that may occur
          console.error("Error during payment:", error.message);
          reject(error);
        });
    })

  }

  return {
    stripeRef,
    card,
    setupClientSecret,
    confirmCardPayment,
    initialiseStripe
  }
})