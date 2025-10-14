<script setup lang="ts">
const locationsStore = useLocationsStore()
const pitchesStore = usePitchesStore()
const timeslotsStore = useTimeslotsStore()

await Promise.all([
  useAsyncData(() => locationsStore.fetchLocations()),
  useAsyncData(() => pitchesStore.fetchPitches()),
  useAsyncData(() => timeslotsStore.fetchTimeslots())
])

const sportsStore = useSportsStore()
const { sports } = storeToRefs(sportsStore)
</script>

<template>
  <PageBannerVenues />
  <template v-for="sport in sports">
    <SectionSportVenues :sport-slug="sport.slug" />
  </template>
</template>