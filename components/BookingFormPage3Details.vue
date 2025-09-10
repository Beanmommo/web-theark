<script setup lang="ts">
import type { GroupedTimeslots, BookingSlotDetails } from '~/types/data';

defineProps({
  groupedTimeslots: {
    type: Object as PropType<GroupedTimeslots>,
    default: {}
  }
})

const dayjs = useDayjs()
const route = useRoute()

const venue = computed(() => route.query.venue)

function formatDate(date: string)
{
  return dayjs(date, 'YYYY-MM-DD').format('MMMM DD, YYYY')
}

function formatSlot(slot: BookingSlotDetails)
{
  return `Pitch ${slot.pitch} : ${slot.start} - ${slot.end}`
}
</script>

<template>
  <div class="bookingFormPage3Details">
    <h5>Booking Details</h5>
    <div class="details">
      <div class="venue">{{ venue }}</div>
      <template v-for="(dateBookings, date) in groupedTimeslots">
        <div class="dateDetails">
          <div class="date">{{ formatDate(date as string) }}</div>
          <template v-for="slot in dateBookings">
            <div class="slot">{{ formatSlot(slot) }}</div>
          </template>
        </div>
      </template>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.bookingFormPage3Details {
  display: grid;
  max-width: $main-max;
  grid-gap: $margin;
}

.venue {
  color: green;
  font-weight: bold;
  font-size: 1.2rem;
}

.details {
  display: grid;
  grid-gap: $margin;
  background: rgb(245, 255, 245);
  border-width: 3px;
  border-style: solid;
  border-color: green;
  padding: $margin;
}

.date {
  color: green;
}
</style>