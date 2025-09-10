<script setup lang="ts">
import { PaymentMethods } from '~/types/data';

const paymentMethod = ref('' as PaymentMethods)

const emit = defineEmits(['update'])

function inputHandler(event: Event)
{
  emit('update', (event.target as HTMLInputElement).value as string)
}

</script>

<template>
  <div class="paymentSelection">
    <h5>Payment Method</h5>
    <v-radio-group v-model="paymentMethod" @input="inputHandler">
      <PaymentMethodPayNow />
      <PaymentMethodCreditCard />
    </v-radio-group>
  </div>
</template>

<style lang="scss" scoped>
.paymentSelection {
  display: flex;
  flex-direction: column;
  gap: $margin;
}
</style>