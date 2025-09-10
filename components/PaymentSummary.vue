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
  <div class="paymentSummary">
    <div class="subtotal">
      <h6> Subtotal</h6>
      <div>${{ totalCostData.subtotal.toFixed(2) }}</div>
    </div>
    <div class="discount" v-if="totalCostData.discount > 0">
      <h6> Discount</h6>
      <div>(${{ totalCostData.discount.toFixed(2) }})</div>
    </div>
    <div class="transactionFee" v-if="totalCostData.transactionFee > 0">
      <h6> Transaction Fee ({{ totalCostData.transactionPercentage }}%)</h6>
      <div>${{ totalCostData.transactionFee.toFixed(2) }}</div>
    </div>
    <div class="gst">
      <h6> GST ({{ totalCostData.gstPercentage }}%)</h6>
      <div>${{ totalCostData.gst.toFixed(2) }}</div>
    </div>

    <div class="totalpayable">
      <h6> Total Payable</h6>
      <div>${{ totalCostData.totalPayable.toFixed(2) }}</div>
    </div>
  </div>

</template>