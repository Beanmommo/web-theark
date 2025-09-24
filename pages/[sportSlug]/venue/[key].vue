<script setup lang="ts">

const locationsStore = useLocationsStore()
const pitchesStore = usePitchesStore()
await Promise.all([
    useAsyncData(() => locationsStore.fetchLocations()),
    useAsyncData(() => pitchesStore.fetchPitches()),
    //   useAsyncData(() => timeslotsStore.fetchTimeslots()),
    //   useAsyncData(() => configStore.fetchConfig())
])

</script>

<template>
    <VenuePage />
</template>