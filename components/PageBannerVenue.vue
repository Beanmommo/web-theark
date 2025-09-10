<script setup lang="ts">
import { type Venue } from '../types/data'

const { getURL } = useCld()
const props = defineProps({
  venue: {
    type: Object as PropType<Venue>,
    required: true
  }
})

const venuePicture = computed(() =>
{
  if (!props.venue.publicId) return ''
  return getURL(props.venue.publicId)
})
</script>

<template>
  <section class="pageBannerVenue" :style="{ backgroundImage: `url(${venuePicture})` }">
    <h2>{{ venue.name }}</h2>
  </section>
</template>

<style lang="scss" scoped>
.pageBannerVenue {
  background-repeat: no-repeat;
  background-size: cover;
  height: 500px;
  display: grid;
  justify-items: center;
  align-items: center;
}

h2 {
  color: white;
}
</style>