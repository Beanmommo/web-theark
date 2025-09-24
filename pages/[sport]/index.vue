<template>
    <!-- TODO: Connect this with firebase later -->
    <ClientOnly v-if="sport === 'Futsal'">
        <PromotionDialog />
    </ClientOnly>
    <SectionQuickBooking />
    <SectionSportVenues :sport-name="sport" />
</template>

<script setup lang="ts">
const route = useRoute()
const sport = route.params.sport as string

const sportsStore = useSportsStore()

onBeforeMount(() => {
    sportsStore.setActiveSport(sport as string)
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