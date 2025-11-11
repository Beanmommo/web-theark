<script setup lang="ts">
import { usePitchesStore } from '~/stores/pitches'
import { storeToRefs } from 'pinia'
import type { Pitch } from '~/types/data'

type VenuePitchItem = {
  icon: string;
  label: string;
}

type VenuePitchDisplay = {
  borderColor: string;
  itemBackgroundColor: string;
  items: VenuePitchItem[];
}

type VenuePitchBuilderContext = {
  pitches: Pitch[];
}

type VenuePitchConfig = {
  borderColor: string;
  itemBackgroundColor: string;
  buildItems: (context: VenuePitchBuilderContext) => VenuePitchItem[];
}

const props = defineProps({
  locationKey: {
    type: String,
    required: true
  },
  sportSlug: {
    type: String,
    default: 'futsal'
  }
})

const pitchesStore = usePitchesStore()
const { pitches } = storeToRefs(pitchesStore)

const normalizedSportSlug = computed(() => props.sportSlug?.toLowerCase() || 'futsal')

const pitchesForVenue = computed(() => {
  if (!pitches.value) return []
  return pitches.value.filter((pitch: Pitch) => pitch.locationKey === props.locationKey)
})

const pitchesBySport = computed(() => {
  return pitchesForVenue.value.reduce((acc, pitch) => {
    const sport = (pitch.typeOfSports || 'futsal').toLowerCase()
    if (!acc[sport]) {
      acc[sport] = []
    }
    acc[sport].push(pitch)
    return acc
  }, {} as Record<string, Pitch[]>)
})

const selectedSportPitches = computed(() => {
  return pitchesBySport.value[normalizedSportSlug.value] ?? []
})

const buildFutsalItems = () => {
  const pitches = selectedSportPitches.value
  console.log('pitches', pitches)
  const entries: VenuePitchItem[] = [
    {
      icon: '/Icon/pitch_green_icon2.svg',
      label: 'Astro Turf'
    }
  ]
  const groupedBySize = useGroupBy(pitches, 'size')
  for (const [key, value] of Object.entries(groupedBySize)) {
    if (key === 'unknown') continue
    entries.push({
      icon: '/Icon/pitch_green_icon3.svg',
      label: `Field ${key} Aside`
    })
  }
  entries.push({
    icon: '/Icon/pitch_green_icon1.svg',
    label: `${pitches.length} Field${pitches.length > 1 ? 's' : ''}`
  })
  return entries
}

const buildPickleballItems = ({ pitches }: VenuePitchBuilderContext): VenuePitchItem[] => {
  const count = pitches.length
  return [
    {
      icon: '/Icon/pitch_blue_icon1.svg',
      label: `${count} Court${count === 1 ? '' : 's'}`
    }
  ]
}

const sportConfigs: Record<string, VenuePitchConfig> = {
  futsal: {
    borderColor: '#0A8900',
    itemBackgroundColor: '#F7FFF4',
    buildItems: () => buildFutsalItems()
  },
  pickleball: {
    borderColor: '#2282d6',
    itemBackgroundColor: '#E5F3FF',
    buildItems: buildPickleballItems
  }
}

const sportVenueItem = computed<VenuePitchDisplay | null>(() => {
  const config = sportConfigs[normalizedSportSlug.value]
  if (!config) return null

  const pitchesStore = usePitchesStore()
  const { pitches } = storeToRefs(pitchesStore)
  const selectedSportPitches = computed(() => {
    return pitches.value.filter((pitch: Pitch) => pitch.locationKey === props.locationKey && pitch.typeOfSports === normalizedSportSlug.value)
  })

  const items = config.buildItems({
    pitches: selectedSportPitches.value
  })

  if (!items.length) return null

  return {
    borderColor: config.borderColor,
    itemBackgroundColor: config.itemBackgroundColor,
    items
  }
})

onMounted(() => {
  console.log('sportVenueItem', sportVenueItem.value)
})
</script>

<template>
  <div v-if="sportVenueItem" class="pitchesItem">
    <div class="icon__item" v-for="item in sportVenueItem.items" :key="item.label" :style="{
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
