<template>
    <ClientOnly>
        <PromotionDialog />
    </ClientOnly>
    <SectionQuickBooking />
    <SectionSportVenues />
</template>

<script setup lang="ts">
const route = useRoute()
const sport = route.params.sport

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