<script setup lang="ts">
import { type PackageDetails } from '../types/data';
const props = defineProps({
  packageItem: {
    type: Object as PropType<PackageDetails>,
    required: true
  }
})

const dayjs = useDayjs()

const expiryDate = computed(() =>
{
  return dayjs().add(props.packageItem.expiryPeriod, 'months').format('DD MMM YYYY')
})
</script>

<template>
  <div class="packagePurchasePage3Details">
    <h5>Package Purchase Details</h5>
    <div class="details">
      <div class="title">{{ packageItem.title }}</div>
      <div>
        <div class="details--text">Total Value : ${{ packageItem.value }}</div>
        <div class="details--text">Amount Payable : ${{ packageItem.amount }}</div>
        <div class="details--text">Expiry Date : {{ expiryDate }}</div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.packagePurchasePage3Details {
  display: grid;
  max-width: $main-max;
  grid-gap: $margin;
}

.details {
  display: grid;
  grid-gap: $margin;
  background: rgb(245, 255, 245);
  border-width: 3px;
  border-style: solid;
  border-color: green;
  padding: $margin;

  .title {
    color: green;
    font-weight: bold;
    font-size: 1.2rem;
  }

  &--text {
    color: $primary-green;
    font-weight: 500;
  }
}
</style>