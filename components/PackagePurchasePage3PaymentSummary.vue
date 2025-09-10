<script setup lang="ts">
import type { TotalCostData } from '../types/data'
defineProps({
  totalCostData: {
    type: Object as PropType<TotalCostData>,
    required: true
  }
})
</script>

<template>
  <div class="packagePurchasePage3PaymentSummary">
    <h5>Payment Summary</h5>
    <div class="details">
      <PaymentSummary :totalCostData="totalCostData" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.packagePurchasePage3PaymentSummary {
  display: flex;
  flex-direction: column;
  gap: $margin;
}


.details {
  display: grid;
  grid-gap: $margin;
  background: rgb(255, 255, 255);
  border-width: 3px;
  border-style: solid;
  border-color: rgb(62, 62, 62);
  padding: $margin;
}
</style>