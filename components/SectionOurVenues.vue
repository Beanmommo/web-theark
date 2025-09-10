<script setup lang="ts">
import { useLocationsStore } from '~/stores/locations'
import { storeToRefs } from 'pinia'
const locationsStore = useLocationsStore()
const { locations } = storeToRefs(locationsStore)

defineProps({
  showTitle: {
    type: Boolean,
    default: true
  }
})

</script>

<template>
  <SectionContainer>
    <div class="title__container" v-if="showTitle">
      <IconOurVenue />
      <h2>Our Venues</h2>
    </div>
    <div class="venues__container">
      <template v-for="venue in locations">
        <VenueCardItem :venue="venue" />
      </template>
    </div>
  </SectionContainer>
</template>

<style lang="scss" scoped>
.title__container {
  display: flex;
  align-items: center;
}

.venues__container {
  display: grid;
  grid-gap: $p-margin;
}
</style>~/stores/locations