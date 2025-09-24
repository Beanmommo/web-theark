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

const selectedSport = computed(() => {
    return sportsStore.getSportBySlug(props.sportSlug)
})

const sportVenues = computed(() => {
    return useSport().getSportVenues(props.sportSlug)
})
</script>

<style lang="scss" scoped>
.venues__container {
    display: grid;
    grid-gap: $p-margin;
}
</style>