<script setup lang="ts">
const locationsStore = useLocationsStore();
const pitchesStore = usePitchesStore();
const timeslotsStore = useTimeslotsStore();
const sportsStore = useSportsStore();

// Fetch data needed for sport venues display
await Promise.all([
  useAsyncData("locations", () => locationsStore.fetchLocations()),
  useAsyncData("pitches", () => pitchesStore.fetchPitches()),
  useAsyncData("timeslots", () => timeslotsStore.fetchTimeslots()),
  useAsyncData("sports", () => sportsStore.fetchSports()),
]);

const { bookableSports, comingSoonSports } = storeToRefs(sportsStore);
</script>

<template>
  <section class="sport__container">
    <!-- Show bookable sports -->
    <template v-for="sport in bookableSports">
      <SectionSports :sport="sport" />
    </template>

    <!-- Show coming soon sports -->
    <template v-for="sport in comingSoonSports">
      <SectionSports :sport="sport" :coming-soon="true" />
    </template>
  </section>
</template>

<style lang="scss" scoped>
.sport__container {
  display: grid;
  grid-template-columns: 1fr;
  min-height: calc(
    100vh - $header-height - 382px
  ); // 100vh - header height - footer min-height

  // Mobile: single column
  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
    min-height: calc(100vh - $header-height - 400px);
  }

  // Tablet and above: two columns
  @media (min-width: $tablet) {
    grid-template-columns: 1fr 1fr;
  }

  // Desktop and above: two columns
  @media (min-width: $desktop) {
    grid-template-columns: 1fr 1fr;
  }

  // X-Desktop and above: two columns
  @media (min-width: $x-desktop) {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
