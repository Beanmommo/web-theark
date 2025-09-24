<script setup lang='ts'>
import { onMounted, computed, ref, watch } from 'vue'
import type { BookingSlotDetails, GroupedTimeslots, BookingDetails } from '~/types/data';
import { useLocationsStore } from '~/stores/locations'
import { useTimeslotsStore } from '~/stores/timeslots'
import { usePitchesStore } from '~/stores/pitches'
import { usePresalesStore } from '~/stores/presales';
import { storeToRefs } from 'pinia'


const emit = defineEmits(['update', 'next'])

const dayjs = useDayjs()
const route = useRoute()
const router = useRouter()

const locationsStore = useLocationsStore()
const { locations } = storeToRefs(locationsStore)
const timeslotsStore = useTimeslotsStore();
const { timeslots } = storeToRefs(timeslotsStore);
const pitchesStore = usePitchesStore()
const { pitches } = storeToRefs(pitchesStore)
const presalesStore = usePresalesStore()
const sportsStore = useSportsStore()
const { sports } = storeToRefs(sportsStore)

const timeSelector = ref()
const selectedDate = ref()
const selectedVenue = ref()
const selectedSport = ref()
const selectedTimeslots = ref([] as BookingSlotDetails[])
const initialLoad = ref(true)

onMounted(() => {
  initialiseQuery()
})

watch(selectedSport, () => {
  selectedTimeslots.value = []
  if (!initialLoad.value) {
    selectedVenue.value = undefined
    router.replace({ query: { sport: selectedSport.value, date: selectedDate.value } })
  }
  initialLoad.value = false
})

watch(selectedVenue, () => {
  selectedTimeslots.value = []
  router.replace({ query: { sport: selectedSport.value, venue: selectedVenue.value, date: selectedDate.value } })
})

watch(selectedDate, () => {
  selectedTimeslots.value = []
  router.replace({ query: { sport: selectedSport.value, venue: selectedVenue.value, date: selectedDate.value } })
})

const sportPitches = computed(() => {
  if (!selectedSport.value) return []
  return pitches.value.filter(pitch => pitch.typeOfSports === selectedSport.value)
})

const availableLocations = computed(() => {
  if (!selectedSport.value) return []
  const availableLocationsKey = Array.from(new Set(sportPitches.value.map(pitch => pitch.locationKey))) //Gets unique locationKey
  return locations.value.filter(location => availableLocationsKey.includes(location.key))
})
const showTimeSelector = computed(() => {
  return selectedDate.value && selectedVenue.value
})

const location = computed(() => {
  return locations.value.find(item => selectedVenue.value === item.name)
})

const locationPitches = computed(() => {
  if (!location.value) return []
  return pitches.value.filter(pitch => pitch.locationKey === location.value?.key && pitch.typeOfSports === selectedSport.value);
})

const locationTimeslots = computed(() => {
  if (!location.value) return []
  return timeslots.value.filter(timeslot => timeslot.locationKey === location.value?.key)
})

const totalPayable = computed(() => {
  let total = 0;
  selectedTimeslots.value &&
    selectedTimeslots.value.forEach((slot: BookingSlotDetails) => {
      total += slot.rate;
    });
  return total
})

function initialiseQuery() {
  initialLoad.value = true
  if (route.params.sportSlug) selectedSport.value = route.params.sportSlug;
  if (!route.query.venue) return;
  selectedVenue.value = route.query.venue
}

function selectHandler(timeslots: BookingSlotDetails[]) {
  selectedTimeslots.value = timeslots
  const groupedTimeslots = groupAndSortTimeslots(timeslots)
  emit('update', groupedTimeslots)
}

function groupAndSortTimeslots(timeslots: BookingSlotDetails[]) {
  let sortedBookings = {} as GroupedTimeslots
  const groupedBookings = useGroupBy(timeslots, "date");
  const sortedKeys = useOrderBy(
    Object.keys(groupedBookings),
    [(date: string) => dayjs(date, "DD-MM-YYYY")],
    ["asc"]
  );
  sortedKeys.forEach((key: string) => {
    sortedBookings[key] = groupedBookings[key];
  });
  return sortedBookings
}

function clickHandler(date: string) {
  selectedDate.value = date
}

function clickHandlerBookNow() {
  const bookingDetails: BookingDetails = {
    location: selectedVenue.value,
    slots: selectedTimeslots.value,
    date: selectedDate.value
  }
  presalesStore.updateBookingDetails(bookingDetails)
  emit('next')
}
</script>

<template>
  <div class="bookingFormPage1">
    <!-- <FieldInputSelect v-model="selectedSport" placeholder="Sport" :options="sports" /> -->
    <FieldInputSelect v-model="selectedVenue" placeholder="Venue" :options="availableLocations" />
    <BookingFormDateSelector :selectedDate="selectedDate" @click="clickHandler" />
    <div ref='timeSelector' />
    <template v-if="location">
      <BookingFormTimeSelector :date="selectedDate" :location="selectedVenue" :locationData="location"
        :locationPitches="locationPitches" :locationTimeslots="locationTimeslots" @select="selectHandler"
        v-if="showTimeSelector" />
    </template>
    <BookingCallToAction :totalPayable="totalPayable" @click="clickHandlerBookNow" v-if="totalPayable > 0" />
  </div>
</template>

<style lang="scss" scoped>
.bookingFormPage1 {
  display: grid;
  margin: $margin auto;
  max-width: $main-max;
  padding: $margin;
  grid-gap: $margin;
}
</style>

<style>
.vc-highlight-content-solid {
  color: white !important;
}

.vc-day {
  z-index: 0;
}
</style>