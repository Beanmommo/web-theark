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

</script>

<template>
  <ClientOnly>
    <PromotionDialog />
  </ClientOnly>
  <SectionQuickBooking />
  <SectionSports />
  <SectionOurVenues />
</template>