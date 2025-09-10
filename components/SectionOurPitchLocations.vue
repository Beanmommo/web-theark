<script setup lang="ts">
import { useLocationsStore } from '~/stores/locations'
import { storeToRefs } from 'pinia'
const locationsStore = useLocationsStore()
const { locations } = storeToRefs(locationsStore)

</script>

<template>
  <SectionContainer>
    <h3>Our Pitch Location</h3>
    <template v-for="venue in locations">
      <div>
        <h4>{{ venue.name }}</h4>
        <div class="address__container">
          <IconMapMarker class="address__container--icon" />
          <span>{{ venue.address }}</span>
        </div>
      </div>
    </template>
  </SectionContainer>
</template>

<style lang="scss" scoped>
.address__container {
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  align-items: center;
  grid-gap: $margin;

  &--icon {
    height: 1.5rem;
    color: green;
  }
}

h4 {
  padding: 0;
  margin: 0;
}
</style>~/stores/locations