<script setup lang="ts">
import { type Venue } from '../types/data'

defineProps({
  venue: {
    type: Object as PropType<Venue>,
    required: true
  }
})
</script>

<template>
  <section class="sectionVenueDetails">
    <VenuePitchesItem :locationKey="venue.key" />
  </section>
</template>