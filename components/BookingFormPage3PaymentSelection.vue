<script setup lang="ts">
import { PaymentMethods, type TotalCostData } from '~/types/data';

const props = defineProps({
  totalCostData: {
    type: Object as PropType<TotalCostData>,
    required: true
  }
})

const creditsStore = useCreditsStore()
const { totalCreditsLeft } = storeToRefs(creditsStore)

const paymentMethod = ref('' as PaymentMethods)

const emit = defineEmits(['update'])

const showMembershipCredit = computed(() =>
{
  return totalCreditsLeft.value >= props.totalCostData.total
})

function inputHandler(event: Event)
{
  emit('update', (event.target as HTMLInputElement).value as string)
}

</script>

<template>
  <div class="bookingFormPage3PaymentSelection">
    <h5>Payment Method</h5>
    <v-radio-group v-model="paymentMethod" @input="inputHandler">
      <PaymentMethodPayNow />
      <PaymentMethodCreditCard />
      <PaymentMethodMembershipCredit v-if="showMembershipCredit" />
    </v-radio-group>
  </div>
</template>

<style lang="scss" scoped>
.bookingFormPage3PaymentSelection {
  display: flex;
  flex-direction: column;
  gap: $margin;
}
</style>