<template>
    <SectionContainer>
        <h2>{{ activeSport?.name }} Venues</h2>
        <div class="venues__container">
            <template v-for="venue in activeSportVenues">
                <SportVenueCardItem :venue="venue" :sport-name="sportName" />
            </template>
        </div>
    </SectionContainer>
</template>


<script setup lang="ts">

const sportsStore = useSportsStore()
const { activeSport } = storeToRefs(sportsStore)
const sportName = computed(() => activeSport.value?.name ?? '')

const { activeSportVenues } = useSport()
</script>

<style lang="scss" scoped>
.venues__container {
    display: grid;
    grid-gap: $p-margin;
}
</style>