<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { PaymentMethods } from '../types/data'

const creditsStore = useCreditsStore()
const { totalCreditsLeft } = storeToRefs(creditsStore)
const presalesStore = usePresalesStore()
const { bookingDetails, totalCostData, paymentData } = storeToRefs(presalesStore)
const dayjs = useDayjs()


const isMembershipCredit = computed(() =>
{
  return paymentData.value.paymentMethod === PaymentMethods.MEMBERSHIP_CREDIT
})
function formatDate(date: string)
{
  return dayjs(date, 'YYYY-MM-DD').format('MMMM DD, YYYY')
}
</script>

<template>
  <div class="bookingFormPage3PaymentSummary">
    <h5>Payment Summary</h5>
    <div class="details">
      <div class="bookingDetails">
        <h5>{{ bookingDetails.location }}</h5>
        <template v-for="slot in bookingDetails.slots">
          <div class="slotDetails">
            <div class="pitch">Pitch {{ slot.pitch }} on {{ formatDate(slot.date) }} from {{ slot.start }} - {{ slot.end
              }}</div>
            <div class="rate">${{ slot.rate.toFixed(2) }}</div>
          </div>
          <span></span>
        </template>
      </div>
      <div>
        <div class="subtotal" v-if="totalCostData.subtotal !== totalCostData.totalPayable">
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
        <div class="gst" v-if="totalCostData.gst > 0">
          <h6> GST ({{ totalCostData.gstPercentage }}%)</h6>
          <div>${{ totalCostData.gst.toFixed(2) }}</div>
        </div>
        <div class="creditsLeft" v-if="isMembershipCredit">
          <h6> Total Credits Left</h6>
          <div>${{ totalCreditsLeft.toFixed(2) }}</div>
        </div>
        <div class="totalpayable">
          <h6> Total Payable</h6>
          <div>${{ totalCostData.totalPayable.toFixed(2) }}</div>
        </div>
        <div class="creditsLeft" v-if="isMembershipCredit">
          <h6> Remaining Credits</h6>
          <div>${{ (totalCreditsLeft - totalCostData.totalPayable).toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bookingFormPage3PaymentSummary {
  display: flex;
  flex-direction: column;
  gap: $margin;
}

.pitch {
  font-size: 0.9rem;
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

.slotDetails {
  display: flex;
  justify-content: space-between;
  padding: $unit;
  border: $border-light;
  margin: $unit;
  border-radius: $border-radius;
}

.subtotal,
.gst,
.totalpayable,
.discount,
.transactionFee,
.creditsLeft {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $unit;
  box-shadow: $box-shadow;
  margin: $unit;

  font-weight: bold;
}
</style>