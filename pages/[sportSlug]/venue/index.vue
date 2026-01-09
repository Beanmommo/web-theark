<template>
  <!-- Coming Soon Section -->
  <SectionComingSoon
    v-if="!isBookable && currentSport"
    :sport="currentSport"
    :publish-date="publishDate"
  />

  <!-- Quick Booking Section -->
  <SectionQuickBooking v-else />

  <!-- Sport Venues Section -->
  <SectionSportVenues :sport-slug="sportSlug" />
</template>

<script setup lang="ts">
const route = useRoute();
const sportSlug = route.params.sportSlug as string;

const sportsStore = useSportsStore();
const locationsStore = useLocationsStore();
const pitchesStore = usePitchesStore();
const timeslotsStore = useTimeslotsStore();
const configStore = useConfigStore();

await Promise.all([
  useAsyncData(() => locationsStore.fetchLocations()),
  useAsyncData(() => pitchesStore.fetchPitches()),
  useAsyncData(() => timeslotsStore.fetchTimeslots()),
  useAsyncData(() => configStore.fetchConfig()),
  useAsyncData(() => sportsStore.fetchSports()),
]);

// Set active sport after sports are loaded
sportsStore.setActiveSportBySlug(sportSlug as string);

const dayjs = useDayjs();

// Check if current sport is bookable
const currentSport = computed(() => sportsStore.activeSport);
const isBookable = computed(() => {
  if (!currentSport.value) return false;
  return sportsStore.isBookable(currentSport.value);
});

// Format publish date for display
const publishDate = computed(() => {
  if (!currentSport.value?.websitePublishDate) return "";
  return dayjs(currentSport.value.websitePublishDate).format("MMMM D, YYYY");
});
</script>
