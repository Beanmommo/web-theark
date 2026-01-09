<script setup lang="ts">
import { useTheme } from "vuetify/lib/composables/theme.mjs";
import type { Sport } from "../types/sport";
import type { PropType } from "vue";
import type { Timeslot } from "../types/data";

const props = defineProps({
  sport: {
    type: Object as PropType<Sport>,
    required: true,
  },
  comingSoon: {
    type: Boolean,
    default: false,
  },
});

const theme = useTheme();
const router = useRouter();
const sportsStore = useSportsStore();

// Check if sport is bookable
const isBookable = computed(() => {
  return sportsStore.isBookable(props.sport);
});

function clickHandlerBookNow() {
  if (!isBookable.value) return; // Don't navigate if coming soon
  router.push(`/${props.sport.slug}`);
}

const accentColor = computed(() => {
  const sport = sportsStore.getSportByName(props.sport.name);
  if (!sport) return "#008000"; // Default green fallback

  // Check if theme exists before accessing it
  const sportTheme = theme.themes.value[sport.theme];
  if (!sportTheme || !sportTheme.colors) {
    console.warn(
      `Theme "${sport.theme}" not found for sport "${sport.name}", using default color`
    );
    return "#008000"; // Default green fallback
  }

  return sportTheme.colors.accent;
});

// Calculate dynamic starting rate from timeslots filtered by typeOfSports
const timeslotsStore = useTimeslotsStore();
const { timeslots } = storeToRefs(timeslotsStore);

const locationsStore = useLocationsStore();

const startingRate = computed(() => {
  // Normalize sport slug for comparison
  const normalizedSportSlug = props.sport.slug.toLowerCase();

  // Filter timeslots by typeOfSports matching the sport slug
  // AND check if the location is active
  const sportTimeslots = timeslots.value.filter((timeslot: Timeslot) => {
    const timeslotSport = timeslot.typeOfSports?.toLowerCase() || "futsal";

    // Check if sport matches
    if (timeslotSport !== normalizedSportSlug) {
      return false;
    }

    // Check if location is active
    const location = locationsStore.getLocationByKey(timeslot.locationKey);
    if (!location || !location.active) {
      return false;
    }

    return true;
  });

  // If no timeslots found, return the hardcoded fallback
  if (sportTimeslots.length === 0) {
    return props.sport.startingRate;
  }

  // Get all rates and find the minimum
  const rates = sportTimeslots.map((timeslot: Timeslot) => {
    // Use newRate if it exists and has a startDate, otherwise use rate
    if (timeslot.newRate) {
      return parseInt(timeslot.newRate);
    }
    return parseInt(timeslot.rate);
  });

  return Math.min(...rates);
});
</script>

<template>
  <div class="sportCardItem">
    <template v-if="props.sport">
      <div class="sport__icon__container">
        <VIcon :icon="props.sport.icon" size="64" class="sport__icon" />
      </div>
      <div class="item__content">
        <h3>{{ props.sport.name }}</h3>
        <p>
          <b>From SGD ${{ startingRate }}/hour</b>
        </p>
        <sub
          ><b>{{ props.sport.tag }}</b></sub
        >
        <div class="buttons__container">
          <Button
            v-if="isBookable"
            @click="clickHandlerBookNow"
            :color="accentColor"
          >
            Book Now
          </Button>
          <Button v-else :color="'#999'" :disabled="true"> Coming Soon </Button>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.sportCardItem {
  display: grid;
  box-shadow: $box-shadow;
  grid-template-columns: 1fr;

  .sport__icon__container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $margin;
    color: white;
  }

  .item__content {
    display: grid;
    grid-gap: $margin;
    color: white;
    padding: $margin;
    justify-self: center;
    text-align: center;
  }

  .buttons__container {
    margin-top: $margin;
    display: flex;
    justify-content: center;
  }
}
</style>
