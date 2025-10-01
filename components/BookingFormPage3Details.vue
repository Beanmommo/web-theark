<script setup lang="ts">
import { useTheme } from 'vuetify';
import type { GroupedTimeslots, BookingSlotDetails } from '~/types/data';

const props = defineProps({
  groupedTimeslots: {
    type: Object as PropType<GroupedTimeslots>,
    default: {}
  }
})

const dayjs = useDayjs()
const route = useRoute()
const sport = computed(() => route.params.sportSlug)
const venue = computed(() => route.query.venue)

function formatDate(date: string) {
  return dayjs(date, 'YYYY-MM-DD').format('MMMM DD, YYYY')
}

function formatSlot(slot: BookingSlotDetails) {
  let pitchName = 'Pitch'
  if (sport.value === 'pickleball') {
    pitchName = 'Court'
  }
  return `${pitchName} ${slot.pitch} : ${slot.start} - ${slot.end}`
}

const theme = useTheme()
const accentColor = computed(() => {
  return theme.current.value.colors.accent
})

const brighterAccentColor = computed(() => {
  if (sport.value === 'futsal') {
    return '#cefad0'
  } else if (sport.value === 'pickleball') {
    return '#E5F3FF'
  }
  return '#fff'
})

function formatSport(sport: string) {
  return sport.charAt(0).toUpperCase() + sport.slice(1)
}


</script>

<template>
  <div class="bookingFormPage3Details">
    <h5>Booking Details</h5>
    <div class="details" :style="{ borderColor: accentColor, backgroundColor: brighterAccentColor }">
      <div class="venue" :style="{ color: accentColor }">{{ `${venue} - ${formatSport(sport as string)}` }}</div>
      <template v-for="(dateBookings, date) in groupedTimeslots">
        <div class="dateDetails">
          <div class="date" :style="{ color: accentColor }">{{ formatDate(date as string) }}</div>
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
  font-weight: bold;
  font-size: 1.2rem;
}

.details {
  display: grid;
  grid-gap: $margin;
  border-width: 3px;
  border-style: solid;
  padding: $margin;
}

.date {
  color: green;
  font-weight: 500
}
</style>