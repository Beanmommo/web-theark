<script setup lang="ts">
const route = useRoute();
const sportSlug = route.params.sportSlug as string;

const sportsStore = useSportsStore();
const locationsStore = useLocationsStore();
const pitchesStore = usePitchesStore();
const timeslotsStore = useTimeslotsStore();
const configStore = useConfigStore();

await Promise.all([
  useAsyncData("locations", () => locationsStore.fetchLocations()),
  useAsyncData("pitches", () => pitchesStore.fetchPitches()),
  useAsyncData("timeslots", () => timeslotsStore.fetchTimeslots()),
  useAsyncData("config", () => configStore.fetchConfig()),
  useAsyncData("sports", () => sportsStore.fetchSports()),
]);

// Set active sport after sports are loaded
sportsStore.setActiveSportBySlug(sportSlug as string);

const dayjs = useDayjs();

// Check if current sport booking is available
const currentSport = computed(() => sportsStore.activeSport);
const isBookingAvailable = computed(() => {
  if (!currentSport.value) return false;

  // Check bookingPublishDate for actual booking availability
  if (!currentSport.value.bookingPublishDate) return true; // No date = always available

  const bookingDate = new Date(currentSport.value.bookingPublishDate);
  const now = new Date();
  return bookingDate <= now;
});

// Format booking publish date for display
const bookingPublishDate = computed(() => {
  if (!currentSport.value?.bookingPublishDate) return "";
  return dayjs(currentSport.value.bookingPublishDate).format("MMMM D, YYYY");
});
</script>

<template>
  <!-- Coming Soon Section (when booking is not yet available) -->
  <SectionComingSoon
    v-if="!isBookingAvailable && currentSport"
    :sport="currentSport"
    :publish-date="bookingPublishDate"
  />

  <!-- Quick Booking Section (when booking is available) -->
  <SectionQuickBooking v-else />

  <!-- Sport Venues Section -->
  <SectionSportVenues :sport-slug="sportSlug" />
</template>
