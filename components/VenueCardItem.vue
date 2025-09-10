<script setup lang="ts">
import { type Venue } from '../types/data'
import type { PropType } from 'vue'

const props = defineProps({
  venue: {
    type: Object as PropType<Venue>,
    required: true
  }
})

const router = useRouter()

function clickHandlerBookNow()
{
  router.push(`/booking?venue=${props.venue.name}`)
}


</script>

<template>
  <div class="venueCardItem">
    <template v-if="props.venue">
      <CldImage :src="`website/${props.venue.publicId}`" width="800" height="600" :alt="props.venue.name" />
      <div class="item__content">
        <h3>{{ props.venue.name }} Pitch</h3>
        <VenuePitchesItem :locationKey="props.venue.key" />
        <VenueAddress>{{ props.venue.address }}</VenueAddress>
        <div class="buttons__container">
          <VenueFromRates :locationKey="props.venue.key" />
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