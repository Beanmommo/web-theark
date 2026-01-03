<script setup lang="ts">
import type { GroupedTimeslots } from "~/types/data";

// Props
const props = defineProps({
  groupedTimeslots: {
    type: Object as PropType<GroupedTimeslots>,
    required: true,
  },
});

// Stores
const pitchesStore = usePitchesStore();
const locationsStore = useLocationsStore();
const presalesStore = usePresalesStore();
const { pitches } = storeToRefs(pitchesStore);
const { locations } = storeToRefs(locationsStore);
const { bookingDetails } = storeToRefs(presalesStore);

// Reactive state
const terms = ref(false);
const covid = ref(false);
const emit = defineEmits(["update"]);

/**
 * Determines if cancellation is allowed for all selected slots.
 * Returns false if ANY slot belongs to a pitch with allowCancellation: false.
 * This controls whether to show cancellation-related checkboxes (72-hour notice and weather policy).
 */
const allowsCancellation = computed(() => {
  // Extract all slots from grouped timeslots
  const allSlots = Object.values(props.groupedTimeslots).flat();

  // Find the location from bookingDetails
  const location = locations.value.find(
    (loc) => loc.name === bookingDetails.value.location
  );
  if (!location) return true; // Default: allow cancellation if location not found

  // Check each slot's pitch
  for (const slot of allSlots) {
    // Find the pitch matching this slot
    // Match by: locationKey, pitch name, and typeOfSports
    const pitch = pitches.value.find(
      (p) =>
        p.locationKey === location.key &&
        p.name === String(slot.pitch) &&
        p.typeOfSports?.toLowerCase() === slot.typeOfSports?.toLowerCase()
    );

    // If pitch found and has allowCancellation explicitly set to false, disallow
    if (pitch && pitch.allowCancellation === false) {
      return false;
    }
  }

  return true; // Default: allow cancellation
});

/**
 * Validates form based on visible checkboxes.
 * If cancellation is not allowed, only the terms checkbox is required.
 * If cancellation is allowed, both terms and covid checkboxes are required.
 */
function inputHandler() {
  if (allowsCancellation.value) {
    // All checkboxes visible: require terms AND covid
    if (terms.value && covid.value) emit("update", true);
    else emit("update", false);
  } else {
    // Only terms checkbox visible: require only terms
    if (terms.value) emit("update", true);
    else emit("update", false);
  }
}
</script>

<template>
  <div class="bookingFormPage3CheckList">
    <v-checkbox v-model="terms" @input="inputHandler">
      <template v-slot:label>
        <div class="label">
          I accept the
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <NuxtLink to="/content/terms" target="_blank">
                terms and conditions
              </NuxtLink>
            </template>
            Opens in new window
          </v-tooltip>
          <template v-if="allowsCancellation">, including :</template>
        </div>
      </template>
    </v-checkbox>
    <!-- Checkbox 2: 72-hour rescheduling notice - only shown if cancellation is allowed -->
    <v-checkbox v-if="allowsCancellation">
      <template v-slot:label>
        <div class="label">
          Providing more than <b>72 hours'</b> notice (prior to the booking
          date) for rescheduling via 9185 2555.<br />
          Requests with less than <b>72 hours'</b> notice will not be accepted.
        </div>
      </template>
    </v-checkbox>
    <!-- Checkbox 3: Inclement weather policy - only shown if cancellation is allowed -->
    <v-checkbox v-if="allowsCancellation" v-model="covid" @input="inputHandler">
      <template v-slot:label>
        <div class="label">
          Adhering to the inclement weather policy, where ARK will assess and
          confirm whether rescheduling is allowed 45 minutes before the booked
          time.
        </div>
      </template>
    </v-checkbox>
  </div>
</template>

<style lang="scss" scoped>
.label {
  font-size: 1rem;

  b {
    font-weight: 700;
  }
}
</style>
