<script setup lang="ts">
const locationsStore = useLocationsStore()
const { locations } = storeToRefs(locationsStore)
const sportsStore = useSportsStore()
const route = useRoute()
const sportSlug = route.params.sportSlug as string
const sportVenues = computed(() => {
  if (!sportSlug) return locations.value
  return sportsStore.getSportVenues(sportSlug)
})

const pitchName = computed(() => {
  if (sportSlug === 'futsal') {
    return 'Pitch'
  } else if (sportSlug === 'pickleball') {
    return 'Court'
  }
  return 'Venue'
})

</script>

<template>
  <SectionContainer>
    <h3>Our {{ pitchName }} Location</h3>
    <template v-for="venue in sportVenues">
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