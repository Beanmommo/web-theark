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
  console.log("🏢 Venue lookup:", {
    venueName,
    foundLocation: location,
    locationKey: location?.key || "NOT FOUND",
  });
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

/**
 * Check if the promo code matches the timeslot type targeting criteria
 */
function matchesTimeslotTypeTargeting(promocode: PromoCode): boolean {
  // If timeslot type targeting is not configured, skip validation
  if (!promocode.timeslotTypes || promocode.timeslotTypes.length === 0) {
    return true;
  }

  // Check if all selected timeslots match the targeted timeslot types
  const allTimeslots = Object.values(props.groupedTimeslots).flat();

  // If no timeslots selected, cannot validate
  if (allTimeslots.length === 0) {
    return false;
  }

  // All timeslots must be for types in the timeslotTypes array
  return allTimeslots.every((slot) => {
    return promocode.timeslotTypes!.includes(slot.type);
  });
}

function clickHandler() {
  error.value = false;
  valid.value = false;

  console.log("🔍 Promo Code Validation Debug:");
  console.log("  Code entered:", code.value);
  console.log("  Current venue ID:", venueId.value);
  console.log("  Booking date:", date.value.format("YYYY-MM-DD"));
  console.log("  Current date:", dayjs().format("YYYY-MM-DD"));
  console.log("  Selected timeslots:", props.groupedTimeslots);

  const found = promocodes.value.find((promocode) => {
    // Skip if not matching code
    if (
      !promocode.promocode ||
      promocode.promocode.toLowerCase() !== code.value.toLowerCase()
    ) {
      return false;
    }

    console.log("✅ Found matching promo code:", promocode.name);
    console.log("  Promo data:", promocode);

    // Basic validation (location, dates, code match)
    // Empty locations array means "all locations"
    // Support both location keys (new format) and location names (old format)
    const locationMatch =
      !promocode.locations ||
      promocode.locations.length === 0 ||
      promocode.locations.includes(venueId.value) || // Match by location key (new format)
      promocode.locations.includes(venue.value as string); // Match by location name (old format)

    console.log("  Location match:", locationMatch);
    console.log("    Promo locations:", promocode.locations);
    console.log("    Venue ID (key):", venueId.value);
    console.log("    Venue name:", venue.value);

    const publishStartCheck = dayjs().isSameOrAfter(
      promocode.publishStart,
      "day"
    );
    const publishEndCheck = dayjs().isSameOrBefore(promocode.publishEnd, "day");
    const validTillCheck = dayjs(date.value).isSameOrBefore(
      promocode.validTill,
      "day"
    );
    const startDateCheck = dayjs(date.value).isSameOrAfter(
      promocode.startDate,
      "day"
    );

    console.log("  Date validations:");
    console.log(
      "    Publish start check:",
      publishStartCheck,
      `(${dayjs().format("YYYY-MM-DD")} >= ${promocode.publishStart})`
    );
    console.log(
      "    Publish end check:",
      publishEndCheck,
      `(${dayjs().format("YYYY-MM-DD")} <= ${promocode.publishEnd})`
    );
    console.log(
      "    Valid till check:",
      validTillCheck,
      `(${date.value.format("YYYY-MM-DD")} <= ${promocode.validTill})`
    );
    console.log(
      "    Start date check:",
      startDateCheck,
      `(${date.value.format("YYYY-MM-DD")} >= ${promocode.startDate})`
    );

    const basicValidation =
      locationMatch &&
      publishStartCheck &&
      publishEndCheck &&
      validTillCheck &&
      startDateCheck;

    console.log("  Basic validation result:", basicValidation);

    // If basic validation fails, skip this promo code
    if (!basicValidation) {
      console.log("❌ Basic validation failed");
      return false;
    }

    // Additional validation for pitch, sport, and timeslot type targeting
    const pitchMatch = matchesPitchTargeting(promocode);
    const sportMatch = matchesSportTypeTargeting(promocode);
    const timeslotTypeMatch = matchesTimeslotTypeTargeting(promocode);

    console.log("  Pitch match:", pitchMatch);
    console.log("  Sport match:", sportMatch);
    console.log("  Timeslot type match:", timeslotTypeMatch);
    console.log("    Promo timeslot types:", promocode.timeslotTypes);
    console.log(
      "    Selected slot types:",
      Object.values(props.groupedTimeslots)
        .flat()
        .map((s) => s.type)
    );
    console.log(
      "  Final result:",
      pitchMatch && sportMatch && timeslotTypeMatch
    );

    return pitchMatch && sportMatch && timeslotTypeMatch;
  });

  if (found !== undefined) {
    console.log("✅ Promo code validated successfully!");
    valid.value = true;
    emit("update", found);
  } else {
    console.log("❌ Promo code validation failed");
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
