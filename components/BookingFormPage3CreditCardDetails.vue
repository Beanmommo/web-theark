<script setup lang="ts">
import '@stripe/stripe-js'
import { StripeElement } from 'vue-use-stripe'
import { usePaymentsStore } from '~/stores/payments'
import { useStripe } from 'vue-use-stripe'

const emit = defineEmits(['update'])

const paymentsStore = usePaymentsStore()
const error = ref(false)
const errorMessage = ref('')

type ChangeElementType = {
  elementType: string,
  complete: boolean,
  empty: boolean,
  collapsed: boolean,
  value: { type: string },
  error: { code: string, message: string, type: string } | undefined
}

const runtimeConfig = useRuntimeConfig()

const {
  stripe,
  elements: [cardElement],
} = useStripe({
  key: runtimeConfig.public.stripeKey || '',
  elements: [{ type: 'card', options: { hidePostalCode: true } }],
})

onMounted(() =>
{
  paymentsStore.initialiseStripe(stripe.value, cardElement.value)
})

function changeHandler(event: ChangeElementType)
{
  if (event.complete)
  {
    error.value = false
    errorMessage.value = ''
    emit('update', true)
  }

  else if (event.error)
  {
    error.value = true
    errorMessage.value = event.error.message ? event.error.message : ''
    emit('update', false)
  }
}
</script>

<template>
  <div class="bookingFormPage3CreditCardDetails">
    <h5>Card Details</h5>
    <div class="field--cardnumber">
      <StripeElement :element="cardElement" @change="changeHandler" />
    </div>
    <div class="logo">
      <img src="/Logo/stripe_logo.png" alt="Stripe Logo" class="image" />
    </div>
    <AlertWarning v-if="error">
      {{ errorMessage }}</AlertWarning>
  </div>
</template>

<style lang="scss" scoped>
.bookingFormPage3CreditCardDetails {
  display: flex;
  flex-direction: column;
  gap: $margin;
}

.field--cardnumber,
.field--expiry,
.field--cvc {
  padding: 10px 20px 11px;
  background-color: #fff;
  border: 1px solid black;
  border-radius: 5px;
  width: 100%;
  color: black;
}

.fields {
  display: flex;
  gap: 10px;
}

.logo {
  text-align: right;

  .image {
    height: 40px;
  }
}
</style>