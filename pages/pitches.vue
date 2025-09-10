<script setup lang="ts">
const locationsStore = useLocationsStore()
const pitchesStore = usePitchesStore()
const timeslotsStore = useTimeslotsStore()

await Promise.all([
  useAsyncData(() => locationsStore.fetchLocations()),
  useAsyncData(() => pitchesStore.fetchPitches()),
  useAsyncData(() => timeslotsStore.fetchTimeslots())
])
</script>

<template>
  <PageBannerPitches />
  <SectionOurVenues :showTitle="false" />
</template>