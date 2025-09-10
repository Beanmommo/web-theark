<template>
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
</script>