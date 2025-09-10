<template>
    <SectionContainer>
        <h2>{{ activeSport?.name }} Venues</h2>
        <div class="venues__container">
            <template v-for="venue in activeSportVenues">
                <VenueCardItem :venue="venue" />
            </template>
        </div>
    </SectionContainer>
</template>


<script setup lang="ts">

const sportsStore = useSportsStore()
const { activeSport } = storeToRefs(sportsStore)

const { activeSportVenues } = useSport()




</script>