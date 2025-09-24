<script setup lang="ts">
type VenueItem = {
    item: {
        icon: string;
        label: string;
    }[];
    borderColor: string;
    itemBackgroundColor: string;
}
const props = defineProps({
    locationKey: {
        type: String,
        required: true
    },
    sportSlug: {
        type: String,
        required: true
    }
})

import type { Pitch } from '~/types/data'
const pitchesStore = usePitchesStore()
const { pitches } = storeToRefs(pitchesStore)

const pitchInLocation = useFilter(pitches.value, { locationKey: props.locationKey })
const sportPitches = useFilter(pitchInLocation, { typeOfSports: props.sportSlug })

const sportVenueItem = ref({} as VenueItem)

const sportColors: Record<"futsal" | "pickleball", { borderColor: string; itemBackgroundColor: string }> = {
    "futsal": {
        borderColor: "#0A8900",
        itemBackgroundColor: "#F7FFF4"
    },
    "pickleball": {
        borderColor: "#2282d6",
        itemBackgroundColor: "#E5F3FF"
    }
}

onMounted(() => {
    if (props.sportSlug === 'futsal') {
        initialiseFutsalItem()
    } else if (props.sportSlug === 'pickleball') {
        initialisePickleballItem()
    }
})

function initialiseFutsalItem() {
    if (props.sportSlug in sportColors) {
        const colors = sportColors[props.sportSlug as "futsal" | "pickleball"];
        sportVenueItem.value.borderColor = colors.borderColor;
        sportVenueItem.value.itemBackgroundColor = colors.itemBackgroundColor;
        sportVenueItem.value.item = []
        const groupedPitches = useGroupBy(sportPitches, 'size')
        for (const [key, value] of Object.entries(groupedPitches)) {
            sportVenueItem.value.item.push({
                icon: "/Icon/pitch_green_icon1.svg",
                label: `${(value as Pitch[]).length} Field${(value as Pitch[]).length > 1 ? "s" : ""}`
            })
            sportVenueItem.value.item.push({
                icon: "/Icon/pitch_green_icon3.svg",
                label: `${key} Aside`
            })
        }
        sportVenueItem.value.item.push({
            icon: "/Icon/pitch_green_icon2.svg",
            label: "Astro Turf"
        })
    }
}

function initialisePickleballItem() {
    if (props.sportSlug in sportColors) {
        const colors = sportColors[props.sportSlug as "futsal" | "pickleball"];
        sportVenueItem.value.borderColor = colors.borderColor;
        sportVenueItem.value.itemBackgroundColor = colors.itemBackgroundColor;
        sportVenueItem.value.item = []
        const groupedPitches = useGroupBy(sportPitches, 'size')
        for (const [key, value] of Object.entries(groupedPitches)) {
            sportVenueItem.value.item.push({
                icon: "/Icon/court_blue_icon1.svg",
                label: `${(value as Pitch[]).length} Court${(value as Pitch[]).length > 1 ? "s" : ""}`
            })
            sportVenueItem.value.item.push({
                icon: "/Icon/court_blue_icon3.svg",
                label: `${key} Aside`
            })
        }
    }
}
</script>

<template>
    <div class="venueItem">
        <div class="icon__item" v-for="item in sportVenueItem.item" :style="{
            border: sportVenueItem.borderColor,
            background: sportVenueItem.itemBackgroundColor,
        }">
            <img :src="item.icon" :alt="item.label + ' Icon'" />
            <span>{{ item.label }}</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.venueItem {
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