<template>
  <!-- TODO: Connect this with firebase later -->
  <SectionQuickBooking />
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
  useAsyncData("locations", () => locationsStore.fetchLocations()),
  useAsyncData("pitches", () => pitchesStore.fetchPitches()),
  useAsyncData("timeslots", () => timeslotsStore.fetchTimeslots()),
  useAsyncData("config", () => configStore.fetchConfig()),
  useAsyncData("sports", () => sportsStore.fetchSports()),
]);

// Set active sport after sports are loaded
sportsStore.setActiveSportBySlug(sportSlug as string);
</script>
