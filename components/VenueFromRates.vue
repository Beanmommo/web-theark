<script setup lang="ts">
import { computed } from 'vue'
import { type Timeslot } from '~/types/data'
import { useTimeslotsStore } from '~/stores/timeslots'
import { storeToRefs } from 'pinia';

const timeslotsStore = useTimeslotsStore();
const { timeslots } = storeToRefs(timeslotsStore);

const props = defineProps({
  locationKey: String,
  color: {
    type: String,
    default: 'green'
  }
})
const color = computed(() => props.color)
const lowestPrice = computed(() => {
  const timeslotsPrices = useFilter(timeslots.value, { locationKey: props.locationKey }).map((slot: Timeslot) => parseInt(slot.rate))
  const lowestPrice = Math.min(...timeslotsPrices)
  return lowestPrice
})

</script>

<template>
  <div class="fromRates">
    From SGD ${{ lowestPrice }}/hour
  </div>
</template>

<style lang="scss" scoped>
.fromRates {
  color: v-bind(color);
  font-weight: 500;
}
</style>~/stores/timeslots