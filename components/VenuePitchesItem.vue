<script setup lang="ts">
import { usePitchesStore } from '~/stores/pitches'
import { storeToRefs } from 'pinia'
// import { useTheme } from 'vuetify'
import type { Pitch } from '~/types/data'
const pitchesStore = usePitchesStore()
const { pitches } = storeToRefs(pitchesStore)

const props = defineProps({
  locationKey: String,
  sportSlug: {
    type: String,
    required: true
  }
})

// const futsalPitchBySize = computed(() => {
//   const pitchInLocation = useFilter(pitches.value, { locationKey: props.locationKey })
//   const groupedPitches = useGroupBy(pitchInLocation, 'size')
//   return groupedPitches
// })


const venueItem = {
  "futsalTheme": {
    item: [
      {
        icon: "/Icon/pitch_green_icon1.svg",
        label: "Field"
      }, {
        icon: "/Icon/pitch_green_icon2.svg",
        label: "Astro Turf"
      }, {
        icon: "/Icon/pitch_green_icon3.svg",
        label: "Aside"
      }
    ],
    borderColor: "#0A8900",
    itemBackgroundColor: "#F7FFF4"
  },
  "pickleBallTheme": {
    item: [
      {
        icon: "/Icon/pitch_blue_icon1.svg",
        label: "Court"
      }
    ],
    borderColor: "#2282d6",
    itemBackgroundColor: "#E5F3FF"
  }
}

const sportVenueItem = ref({} as any)

watch(() => props.sportSlug, (newVal) => {
  if (newVal === 'futsal') {
    initialiseFutsalItem()
  } else if (newVal === 'pickleball') {
    initialisePickleballItem()
  }
  console.log(sportVenueItem.value)
}, { immediate: true })

function initialiseFutsalItem() {
  sportVenueItem.value = venueItem.futsalTheme
  const pitchInLocation = useFilter(pitches.value, { locationKey: props.locationKey, typeOfSports: 'futsal' })
  const groupedPitches = useGroupBy(pitchInLocation, 'size')
  sportVenueItem.value.item = []
  for (const [key, value] of Object.entries(groupedPitches)) {
    sportVenueItem.value.item.push({
      icon: "/Icon/pitch_green_icon1.svg",
      label: `Field${(value as Pitch[]).length > 1 ? "s" : ""}, ${key} Aside`
    })
  }
  sportVenueItem.value.item.push({
    icon: "/Icon/pitch_green_icon2.svg",
    label: "Astro Turf"
  })
}

function initialisePickleballItem() {
  sportVenueItem.value = venueItem.pickleBallTheme
  const pitchInLocation = useFilter(pitches.value, { locationKey: props.locationKey, typeOfSports: 'pickleball' })
  sportVenueItem.value.item = []
  sportVenueItem.value.item.push({
    icon: "/Icon/pitch_blue_icon1.svg",
    label: `${pitchInLocation.length} Court${pitchInLocation.length > 1 ? "s" : ""}`
  })
}

</script>

<template>
  <div class="pitchesItem">

    <div class="icon__item" v-for="item in sportVenueItem.item" :style="{
      border: sportVenueItem.borderColor,
      background: sportVenueItem.itemBackgroundColor,
    }">
      <!-- <img src="/Icon/pitch_green_icon1.svg" alt="Field Icon" />
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
        </div> -->
      <img :src="item.icon" :alt="item.label + ' Icon'" />
      <span>{{ item.label }}</span>
    </div>

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
  border-radius: 5px;
  padding: $unit 0;

  >img {
    width: 50px;
  }

  >span {
    font-weight: 500;
  }
}
</style>