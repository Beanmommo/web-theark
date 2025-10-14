<template>
    <SectionContainer>
        <h2 v-if="selectedSport">{{ selectedSport?.name }} Venues</h2>
        <div class="venues__container">
            <template v-for="venue in sportVenues">
                <SportVenueCardItem :venue="venue" :sportSlug="props.sportSlug" />
            </template>
        </div>
    </SectionContainer>
</template>


<script setup lang="ts">

const props = defineProps({
    sportSlug: {
        type: String,
        required: true
    }
})

const sportsStore = useSportsStore()
const locationsStore = useLocationsStore()
const pitchesStore = usePitchesStore()

const selectedSport = computed(() => {
    const lowerCaseSlug = props.sportSlug.toLowerCase()
    return sportsStore.getSportBySlug(lowerCaseSlug)
})

const sportVenues = computed(() => {
    const lowerCaseSlug = props.sportSlug.toLowerCase()
    // Explicitly depend on locations and pitches for reactivity
    const _ = [locationsStore.locations, pitchesStore.pitches]
    return sportsStore.getSportVenues(lowerCaseSlug)
})
</script>

<style lang="scss" scoped>
.venues__container {
    display: grid;
    grid-gap: $p-margin;
}
</style>