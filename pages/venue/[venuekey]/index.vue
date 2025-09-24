<script setup lang="ts">
import type { BreadcrumbItem } from 'vuetify/lib/components/VBreadcrumbs/VBreadcrumbs.mjs'

const locationsStore = useLocationsStore()
const pitchesStore = usePitchesStore()
await Promise.all([
    useAsyncData(() => locationsStore.fetchLocations()),
    useAsyncData(() => pitchesStore.fetchPitches()),
    //   useAsyncData(() => timeslotsStore.fetchTimeslots()),
    //   useAsyncData(() => configStore.fetchConfig())
])

const route = useRoute()
const venueKey = route.params.venuekey as string
const selectedVenue = computed(() => {
    return locationsStore.getLocationByKey(venueKey)
})
const sport = route.query.sport as string

const breadcrumbs = computed(() => {
    return [
        {
            title: 'Home',
            href: '/'
        },
        {
            title: sport,
            href: `/${sport}`
        },
        {
            title: selectedVenue.value?.name,
            disabled: true
        }
    ] as BreadcrumbItem[]
}) 
</script>

<template>
    <!-- <SectionContainer>
        <VBreadcrumbs :items="breadcrumbs" />
    </SectionContainer> -->
    <VenuePage />
</template>