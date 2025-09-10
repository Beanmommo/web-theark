<script setup lang="ts">
import { type Pitch } from '../types/data'
import { computed } from 'vue'
import { usePitchesStore } from '~/stores/pitches'
import { storeToRefs } from 'pinia'
const pitchesStore = usePitchesStore()
const { pitches } = storeToRefs(pitchesStore)

const props = defineProps({
  locationKey: String
})

const pitchBySize = computed(() =>
{
  const pitchInLocation = useFilter(pitches.value, { locationKey: props.locationKey })
  const groupedPitches = useGroupBy(pitchInLocation, 'size')
  return groupedPitches
})

</script>

<template>
  <div class="pitchesItem">
    <template v-for="([key, value]) in Object.entries(pitchBySize)">
      <div class="icon__item">
        <img src="/Icon/pitch_green_icon1.svg" alt="Field Icon" />
        <span>
          {{ (value as Pitch[]).length }} Field{{
            (value as Pitch[]).length > 1 ? "s" : ""
          }}
        </span>
      </div>
      <div class="icon__item">
        <img src="/Icon/pitch_green_icon2.svg" alt="Field Icon" />
        <span>Astro Turf</span>
      </div>
      <div class="icon__item">
        <img src="/Icon/pitch_green_icon3.svg" alt="Field Icon" />
        <span>{{ key }} Aside</span>
      </div>
    </template>

  </div>
</template>

<style lang="scss" scoped>
$icon-item-background: rgb(247, 255, 244);
$icon-item-border: 1px solid rgb(10, 137, 0);
$icon-item-border-radius: 5px;

.pitchesItem {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-auto-flow: column;
  justify-content: start;
  grid-gap: $margin;
}

.icon__item {
  display: flex;
  gap: $unit;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: $icon-item-background;
  border: $icon-item-border;
  border-radius: $icon-item-border-radius;
  padding: $unit 0;

  >img {
    width: 50px;
  }

  >span {
    font-weight: 500;
  }
}
</style>