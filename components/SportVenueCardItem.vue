<script setup lang="ts">
import { type Venue } from "../types/data";
import type { PropType } from "vue";

const props = defineProps({
  venue: {
    type: Object as PropType<Venue>,
    required: true,
  },
  sportSlug: {
    type: String,
    required: true,
  },
});

function clickHandlerViewVenue() {
  navigateTo(`/${props.sportSlug}/venue/${props.venue.key}`);
}

// Helper function to capitalize sport name for data lookup
const capitalizeSportName = (slug: string): string => {
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
};

// Computed property to get sport-specific image or fallback to legacy publicId
const venueImageSrc = computed(() => {
  // Try to use sport-specific image first
  if (props.venue.sportsGalleries && props.sportSlug) {
    const sportName = capitalizeSportName(props.sportSlug);
    const sportGallery = props.venue.sportsGalleries[sportName];

    if (sportGallery?.public_id) {
      // Sport-specific public_id already includes 'website/' prefix in the data
      return sportGallery.public_id;
    }
  }

  // Fallback to legacy publicId
  return `website/${props.venue.publicId}`;
});

const courtName = computed(() => {
  if (props.sportSlug === "futsal") {
    return "Pitch";
  } else if (props.sportSlug === "pickleball") {
    return "Court";
  }
  return "";
});

const sportColor = computed(() => {
  if (props.sportSlug === "futsal") {
    return "green";
  } else if (props.sportSlug === "pickleball") {
    return "#2282d6";
  }
  return "";
});
</script>

<template>
  <div class="venueCardItem">
    <template v-if="props.venue">
      <CldImage
        :src="venueImageSrc"
        width="800"
        height="600"
        :alt="props.venue.name"
        @click="clickHandlerViewVenue"
      />
      <div class="item__content">
        <h3>{{ props.venue.name }} {{ courtName }}</h3>
        <SportVenueItem
          :locationKey="props.venue.key"
          :sportSlug="props.sportSlug"
        />
        <VenueAddress :color="sportColor">{{
          props.venue.address
        }}</VenueAddress>
        <div class="buttons__container">
          <VenueFromRates
            :locationKey="props.venue.key"
            :sportSlug="props.sportSlug"
            :color="sportColor"
          />
          <Button @click="clickHandlerViewVenue">View Venue</Button>
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
