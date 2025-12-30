<script setup lang="ts">
import { usePromoCodesStore } from "~/stores/promocodes";
import { useLocationsStore } from "~/stores/locations";
import { usePitchesStore } from "~/stores/pitches";
import { storeToRefs } from "pinia";
import type { GroupedTimeslots, PromoCode } from "~/types/data";

const props = defineProps({
  groupedTimeslots: {
    type: Object as PropType<GroupedTimeslots>,
    default: {},
  },
});

const emit = defineEmits(["update"]);
const promocodesStore = usePromoCodesStore();
const { promocodes } = storeToRefs(promocodesStore);
const locationsStore = useLocationsStore();

const route = useRoute();
const dayjs = useDayjs();
const code = ref("");
const valid = ref(false);
const error = ref(false);

const venue = computed(() => route.query.venue);
const date = computed(() => dayjs(route.query.date as string, "YYYY-MM-DD"));

// Get the location ID from the venue name
const venueId = computed(() => {
  const venueName = venue.value as string;
  const location = locationsStore.getLocation(venueName);
  return location?.key || "";
});

/**
 * Check if the promo code matches the pitch targeting criteria
 */
function matchesPitchTargeting(promocode: PromoCode): boolean {
  // If pitch targeting is not enabled, skip validation
  if (
    !promocode.targetSpecificPitches ||
    !promocode.targetPitches ||
    promocode.targetPitches.length === 0
  ) {
    return true;
  }

  // Check if at least one selected timeslot matches the targeted pitches
  const allTimeslots = Object.values(props.groupedTimeslots).flat();

  // If no timeslots selected, cannot validate
  if (allTimeslots.length === 0) {
    return false;
  }

  // Get pitch keys from the pitches store to map pitch names to keys
  const pitchesStore = usePitchesStore();
  const { pitches } = storeToRefs(pitchesStore);

  // At least one timeslot must be for a pitch in the targetPitches array
  return allTimeslots.some((slot) => {
    // Try to find the pitch by name AND location to get its key
    // Filter by location first, then by name and sport type
    const pitch = pitches.value.find(
      (p) =>
        p.locationKey === venueId.value &&
        p.name === String(slot.pitch) &&
        p.typeOfSports === slot.typeOfSports
    );
    const pitchKey = pitch?.key;
    const pitchName = String(slot.pitch);
    const automatePitchId = slot.automatePitchId;

    return promocode.targetPitches!.some((targetPitch) => {
      // Match by pitch key, pitch name, or automatePitchId
      return (
        pitchKey === targetPitch ||
        pitchName === targetPitch ||
        automatePitchId === targetPitch ||
        pitchName.includes(targetPitch)
      );
    });
  });
}

/**
 * Check if the promo code matches the sport type targeting criteria
 */
function matchesSportTypeTargeting(promocode: PromoCode): boolean {
  // If sport type targeting is not configured, skip validation
  if (!promocode.typeOfSports || promocode.typeOfSports.length === 0) {
    return true;
  }

  // Check if all selected timeslots match the targeted sport types
  const allTimeslots = Object.values(props.groupedTimeslots).flat();

  // If no timeslots selected, cannot validate
  if (allTimeslots.length === 0) {
    return false;
  }

  // All timeslots must be for sports in the typeOfSports array
  return allTimeslots.every((slot) => {
    const slotSport = (slot.typeOfSports || "futsal").toLowerCase();
    return promocode.typeOfSports!.some(
      (targetSport) => targetSport.toLowerCase() === slotSport
    );
  });
}

function clickHandler() {
  error.value = false;
  valid.value = false;

  const found = promocodes.value.find((promocode) => {
    // Skip if not matching code
    if (
      !promocode.promocode ||
      promocode.promocode.toLowerCase() !== code.value.toLowerCase()
    ) {
      return false;
    }

    // Basic validation (location, dates, code match)
    // Empty locations array means "all locations"
    const locationMatch =
      !promocode.locations ||
      promocode.locations.length === 0 ||
      promocode.locations.includes(venueId.value);

    const basicValidation =
      locationMatch &&
      dayjs().isSameOrAfter(promocode.publishStart, "day") &&
      dayjs().isSameOrBefore(promocode.publishEnd, "day") &&
      dayjs(date.value).isSameOrBefore(promocode.validTill, "day") &&
      dayjs(date.value).isSameOrAfter(promocode.startDate, "day");

    // If basic validation fails, skip this promo code
    if (!basicValidation) {
      return false;
    }

    // Additional validation for pitch and sport targeting
    const pitchMatch = matchesPitchTargeting(promocode);
    const sportMatch = matchesSportTypeTargeting(promocode);

    return pitchMatch && sportMatch;
  });

  if (found !== undefined) {
    valid.value = true;
    emit("update", found);
  } else {
    error.value = true;
    emit("update", {});
  }
}
</script>

<template>
  <div class="bookingFormPage3PromoCode">
    <h5>Promo Code</h5>
    <v-row align="center">
      <v-col cols="9">
        <v-text-field
          variant="underlined"
          placeholder="Enter Promo Code"
          v-model="code"
        >
          <template v-slot:append>
            <v-icon class="green" v-if="valid">mdi-check-circle</v-icon>
          </template>
        </v-text-field>
        <span class="red" v-if="error"
          >You have entered an invalid promo code</span
        >
      </v-col>
      <v-col cols="3">
        <div style="text-align: right">
          <v-btn @click="clickHandler">Apply</v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>
.green {
  color: $primary-green;
}

.red {
  color: $primary-red;
}
</style>
