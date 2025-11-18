<script setup lang="ts">
const locationsStore = useLocationsStore();
const pitchesStore = usePitchesStore();

await Promise.all([
  useAsyncData("locations", () => locationsStore.fetchLocations()),
  useAsyncData("pitches", () => pitchesStore.fetchPitches()),
]);
</script>

<template>
  <PageBannerContactUs />
  <SectionOurPitchLocations />
  <SectionContactUsForm />
</template>
