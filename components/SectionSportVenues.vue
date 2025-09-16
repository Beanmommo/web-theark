<template>
    <SectionContainer>
        <h2>{{ props.sportName }} Venues</h2>
        <div class="venues__container">
            <template v-for="venue in sportVenues">
                <SportVenueCardItem :venue="venue" :sport-name="props.sportName" />
            </template>
        </div>
    </SectionContainer>
</template>


<script setup lang="ts">

const sportsStore = useSportsStore()
// const { activeSport } = storeToRefs(sportsStore)
// const sportName = computed(() => activeSport.value?.name ?? '')

// const { activeSportVenues } = useSport()

const props = defineProps({
    sportName: {
        type: String,
        required: true
    }
})

const sportVenues = computed(() => {
    return useSport().getSportVenues(props.sportName)
})
</script>

<style lang="scss" scoped>
.venues__container {
    display: grid;
    grid-gap: $p-margin;
}
</style>