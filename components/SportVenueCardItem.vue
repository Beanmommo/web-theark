<script setup lang="ts">
import { type Venue } from '../types/data'
import type { PropType } from 'vue'

const props = defineProps({
    venue: {
        type: Object as PropType<Venue>,
        required: true
    },
    sportName: {
        type: String,
        required: true
    }
})
// Component Will get pitches in location and filter it with typeOfSport: sportName

const router = useRouter()
function clickHandlerBookNow() {
    router.push(`/booking?sport=${props.sportName}&venue=${props.venue.name}`)
}
const courtName = computed(() => {
    if (props.sportName === 'Futsal') {
        return 'Pitch'
    } else if (props.sportName === 'Pickleball') {
        return 'Court'
    }
    return ''
})

const sportColor = computed(() => {
    if (props.sportName === 'Futsal') {
        return 'green'
    } else if (props.sportName === 'Pickleball') {
        return "#2282d6"
    }
    return ''
})

</script>

<template>
    <div class="venueCardItem">
        <template v-if="props.venue">
            <CldImage :src="`website/${props.venue.publicId}`" width="800" height="600" :alt="props.venue.name" />
            <div class="item__content">
                <h3>{{ props.venue.name }} {{ courtName }}</h3>
                <SportVenueItem :locationKey="props.venue.key" :sportName="props.sportName" />
                <VenueAddress :color="sportColor">{{ props.venue.address }}</VenueAddress>
                <div class="buttons__container">
                    <VenueFromRates :locationKey="props.venue.key" :color="sportColor" />
                    <Button @click="clickHandlerBookNow">Book Now</Button>
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
.venueCardItem {
    display: grid;
    box-shadow: $box-shadow;
    grid-template-columns: 1fr;

    @include md {
        grid-template-columns: 40% 60%;
    }

    .item__content {
        display: grid;
        grid-gap: $unit;
        color: black;
        padding: $margin;

        @include md {
            padding: $margin $margin $margin $p-margin;

        }
    }

    .buttons__container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
</style>