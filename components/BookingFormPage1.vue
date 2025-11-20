<script setup lang="ts">
import { onMounted, computed, ref, watch } from "vue";
import type {
  BookingSlotDetails,
  GroupedTimeslots,
  BookingDetails,
} from "~/types/data";
import { useLocationsStore } from "~/stores/locations";
import { useTimeslotsStore } from "~/stores/timeslots";
import { usePresalesStore } from "~/stores/presales";
import { storeToRefs } from "pinia";

const emit = defineEmits(["update", "next"]);

const dayjs = useDayjs();
const route = useRoute();
const router = useRouter();

const locationsStore = useLocationsStore();
const { locations } = storeToRefs(locationsStore);
const timeslotsStore = useTimeslotsStore();
const { timeslots } = storeToRefs(timeslotsStore);
const presalesStore = usePresalesStore();

const timeSelector = ref();
const selectedDate = ref();
const selectedVenue = ref();
const selectedTimeslots = ref([] as BookingSlotDetails[]);
const initialLoad = ref(true);

onMounted(() => {
  initialiseQuery();
});

const sport = route.params.sportSlug as string;

watch(selectedVenue, () => {
  selectedTimeslots.value = [];
  router.replace({
    query: { venue: selectedVenue.value, date: selectedDate.value },
  });
});

watch(selectedDate, () => {
  selectedTimeslots.value = [];
  router.replace({
    query: { venue: selectedVenue.value, date: selectedDate.value },
  });
});

const sportsStore = useSportsStore();
const { activeSportPitches } = storeToRefs(sportsStore);

// Set the active sport based on route parameter
sportsStore.setActiveSportBySlug(sport);

const availableLocations = computed(() => {
  // if (!selectedSport.value) return []
  const availableLocationsKey = Array.from(
    new Set(activeSportPitches.value.map((pitch) => pitch.locationKey))
  ); //Gets unique locationKey
  return locations.value.filter((location) =>
    availableLocationsKey.includes(location.key)
  );
});
const showTimeSelector = computed(() => {
  return selectedDate.value && selectedVenue.value;
});

const location = computed(() => {
  return locations.value.find((item) => selectedVenue.value === item.name);
});

const locationPitches = computed(() => {
  if (!location.value) return [];
  return activeSportPitches.value.filter(
    (pitch) => pitch.locationKey === location.value?.key
  );
});

const locationTimeslots = computed(() => {
  if (!location.value) return [];
  const normalizedSport = sport?.toLowerCase() || "futsal";
  return timeslots.value.filter((timeslot) => {
    const timeslotSport = timeslot.typeOfSports?.toLowerCase() || "futsal";
    return (
      timeslot.locationKey === location.value?.key &&
      timeslotSport === normalizedSport
    );
  });
});

const totalPayable = computed(() => {
  let total = 0;
  selectedTimeslots.value &&
    selectedTimeslots.value.forEach((slot: BookingSlotDetails) => {
      total += slot.rate;
    });
  return total;
});

function initialiseQuery() {
  initialLoad.value = true;
  // if (route.params.sportSlug) selectedSport.value = route.params.sportSlug;
  if (!route.query.venue) return;
  selectedVenue.value = route.query.venue;
}

function selectHandler(timeslots: BookingSlotDetails[]) {
  selectedTimeslots.value = timeslots;
  const groupedTimeslots = groupAndSortTimeslots(timeslots);
  emit("update", groupedTimeslots);
}

function groupAndSortTimeslots(timeslots: BookingSlotDetails[]) {
  let sortedBookings = {} as GroupedTimeslots;
  const groupedBookings = useGroupBy(timeslots, "date");
  const sortedKeys = useOrderBy(
    Object.keys(groupedBookings),
    [(date: string) => dayjs(date, "DD-MM-YYYY")],
    ["asc"]
  );
  sortedKeys.forEach((key: string) => {
    sortedBookings[key] = groupedBookings[key];
  });
  return sortedBookings;
}

function clickHandler(date: string) {
  selectedDate.value = date;
}

function clickHandlerBookNow() {
  const bookingDetails: BookingDetails = {
    location: selectedVenue.value,
    slots: selectedTimeslots.value,
    date: selectedDate.value,
    typeOfSports: sport,
  };
  presalesStore.updateBookingDetails(bookingDetails);
  emit("next");
}
</script>

<template>
  <div class="bookingFormPage1">
    <FieldInputSelect
      v-model="selectedVenue"
      placeholder="Venue"
      :options="availableLocations"
    />
    <BookingFormDateSelector
      :selectedDate="selectedDate"
      @click="clickHandler"
    />
    <div ref="timeSelector" />
    <template v-if="location">
      <BookingFormTimeSelector
        :date="selectedDate"
        :location="selectedVenue"
        :locationData="location"
        :locationPitches="locationPitches"
        :locationTimeslots="locationTimeslots"
        :sport="sport"
        @select="selectHandler"
        v-if="showTimeSelector"
      />
    </template>
    <BookingCallToAction
      :totalPayable="totalPayable"
      @click="clickHandlerBookNow"
      v-if="totalPayable > 0"
    />
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
