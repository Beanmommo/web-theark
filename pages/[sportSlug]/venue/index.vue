<template>
    <!-- TODO: Connect this with firebase later -->
    <SectionQuickBooking />
    <SectionSportVenues :sport-slug="sportSlug" />
</template>

<script setup lang="ts">
const route = useRoute()
const sportSlug = route.params.sportSlug as string

const sportsStore = useSportsStore()

onBeforeMount(() => {
    sportsStore.setActiveSportBySlug(sportSlug as string)
})

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