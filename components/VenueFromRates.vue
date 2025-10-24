<script setup lang="ts">
import { computed } from 'vue'
import { type Timeslot } from '~/types/data'
import { useTimeslotsStore } from '~/stores/timeslots'
import { useLocationsStore } from '~/stores/locations'
import { storeToRefs } from 'pinia';

const timeslotsStore = useTimeslotsStore();
const { timeslots } = storeToRefs(timeslotsStore);

const locationsStore = useLocationsStore();

const props = defineProps({
  locationKey: String,
  sportSlug: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: 'green'
  }
})
const color = computed(() => props.color)
const lowestPrice = computed(() => {
  // Filter timeslots by location
  let filteredTimeslots = useFilter(timeslots.value, { locationKey: props.locationKey })

  // Filter by sport type if sportSlug is provided
  if (props.sportSlug) {
    const normalizedSportSlug = props.sportSlug.toLowerCase()
    filteredTimeslots = filteredTimeslots.filter((slot: Timeslot) => {
      const timeslotSport = slot.typeOfSports?.toLowerCase() || 'futsal'
      return timeslotSport === normalizedSportSlug
    })
  }

  // Filter out timeslots from inactive locations
  filteredTimeslots = filteredTimeslots.filter((slot: Timeslot) => {
    const location = locationsStore.getLocationByKey(slot.locationKey)
    return location && location.active
  })

  // If no timeslots found, return 0 to avoid Infinity
  if (filteredTimeslots.length === 0) {
    return 0
  }

  // Get all rates and find the minimum
  const timeslotsPrices = filteredTimeslots.map((slot: Timeslot) => {
    // Use newRate if it exists, otherwise use rate
    if (slot.newRate) {
      return parseInt(slot.newRate)
    }
    return parseInt(slot.rate)
  })

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