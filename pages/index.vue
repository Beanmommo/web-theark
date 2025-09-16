<script setup lang="ts">
const locationsStore = useLocationsStore()
const pitchesStore = usePitchesStore()
const timeslotsStore = useTimeslotsStore()
const configStore = useConfigStore()
await Promise.all([
  useAsyncData(() => locationsStore.fetchLocations()),
  useAsyncData(() => pitchesStore.fetchPitches()),
  useAsyncData(() => timeslotsStore.fetchTimeslots()),
  useAsyncData(() => configStore.fetchConfig())
])
const sportsStore = useSportsStore()
const { sports } = storeToRefs(sportsStore)

</script>

<template>
  <ClientOnly>
    <PromotionDialog />
  </ClientOnly>
  <!-- <SectionQuickBooking /> -->
  <template v-for="sport in sports">
    <SectionSports :sport="sport" />
  </template>
  <!-- <SectionOurVenues /> -->
</template>