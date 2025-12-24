<script setup lang="ts">
import { useTheme } from "vuetify";
import type {
  Pitch,
  BookedSlot,
  SlotDetails,
  BookingSlotDetails,
  Blockout,
} from "../types/data";

const dayjs = useDayjs();
const selectedTimeslots = ref([] as BookingSlotDetails[]);

/**
 * Props for the BookingFormTimeSelectorTable component
 * @property {Pitch[]} locationPitches - Array of pitches available at the selected location
 * @property {SlotDetails[]} timeSlots - Array of available time slots for the selected date
 * @property {string} location - The selected location identifier
 * @property {string} date - The selected booking date in YYYY-MM-DD format
 * @property {BookedSlot[]} bookedSlots - Array of already booked slots for the date and location
 * @property {Blockout[]} blockouts - Array of blockouts that may affect slot availability. Blockouts can be:
 *   - Location-wide (targetSpecificPitches: false): Blocks all pitches at the location
 *   - Pitch-specific (targetSpecificPitches: true): Blocks only specified pitches in targetPitches array
 *   - Auto-release (autoReleaseDays > 0): Slots become available after the specified number of days
 */
const props = defineProps({
  locationPitches: {
    type: Array<Pitch>,
    required: true,
  },
  timeSlots: Array<SlotDetails>,
  location: { type: String, required: true },
  date: { type: String, required: true },
  bookedSlots: { type: Array<BookedSlot>, required: true },
  blockouts: { type: Array<Blockout>, default: () => [] },
});

const emit = defineEmits(["select"]);

watch(
  () => props.date,
  async () => reloadData()
);

watch(
  () => props.location,
  () => reloadData()
);

function reloadData() {
  selectedTimeslots.value = [];
}

// Get the unique pitch identifier - use pitch.id, fallback to pitch.name
function getPitchId(pitch: Pitch): string {
  return pitch.id || pitch.name;
}

// Check if a slot's pitch matches a given pitch
// Handles both new format (pitch.id) and legacy format (pitch.name or "Pitch X")
function isPitchMatch(slotPitch: string | number, pitch: Pitch): boolean {
  const slotPitchStr = String(slotPitch);
  const pitchId = getPitchId(pitch);

  // Direct match with pitch.id or pitch.name
  if (slotPitchStr === pitchId || slotPitchStr === pitch.name) {
    return true;
  }

  // Handle legacy "Pitch X" format - extract number and compare
  const legacyMatch = slotPitchStr.match(/^Pitch\s+(\d+)$/i);
  if (legacyMatch) {
    const extractedNumber = legacyMatch[1];
    if (extractedNumber === pitchId || extractedNumber === pitch.name) {
      return true;
    }
  }

  return false;
}

function checkBookedSlot(date: string, timeslot: SlotDetails, pitch: Pitch) {
  const formattedDate = dayjs(date, "YYYY-MM-DD").format();
  const found = props.bookedSlots.find(
    (slot) =>
      isPitchMatch(slot.pitch, pitch) &&
      (slot.start === timeslot.start || slot.end === timeslot.end) &&
      dayjs(slot.date).isSame(formattedDate, "day")
  );
  return found !== undefined;
}

function checkSlot(date: string, start: string, pitch: Pitch) {
  const formattedDate = dayjs(date, "YYYY-MM-DD").format();
  const pitchId = getPitchId(pitch);
  return (
    selectedTimeslots.value &&
    selectedTimeslots.value.findIndex(
      (slot) =>
        slot.start === start &&
        slot.pitch === pitchId &&
        dayjs(slot.date).isSame(formattedDate, "day")
    ) !== -1
  );
}

/**
 * Check if a specific blockout blocks a given date and pitch
 *
 * This function determines whether a slot is blocked by evaluating:
 * 1. Location matching - blockout must be for the current location
 * 2. Date range matching - booking date must be within the blockout period
 * 3. Pitch targeting - either all pitches or specific pitches based on blockout configuration
 *
 * @param blockout - The blockout configuration to check against
 * @param date - The booking date in YYYY-MM-DD format
 * @param pitch - The pitch object being checked
 * @returns true if the slot is blocked by this blockout, false otherwise
 *
 * @example
 * // Location-wide blockout
 * const blockout = {
 *   location: "venue1",
 *   startDate: "2025-01-01",
 *   endDate: "2025-01-31",
 *   targetSpecificPitches: false
 * };
 * isBlockedByBlockout(blockout, "2025-01-15", pitch); // true for all pitches at venue1
 *
 * @example
 * // Pitch-specific blockout with auto-release
 * const blockout = {
 *   location: "venue1",
 *   startDate: "2025-01-01",
 *   endDate: "2025-01-31",
 *   targetSpecificPitches: true,
 *   targetPitches: ["pitchKey1", "pitchKey2"],
 *   autoReleaseDays: 3
 * };
 * // Effective end date: 2025-01-31 - 3 days = 2025-01-28
 * isBlockedByBlockout(blockout, "2025-01-20", pitch); // true if pitch.key is in targetPitches
 * isBlockedByBlockout(blockout, "2025-01-30", pitch); // false (past effective end date)
 */
function isBlockedByBlockout(
  blockout: Blockout,
  date: string,
  pitch: Pitch
): boolean {
  // Check location match - blockout must be for the current location
  if (blockout.location !== props.location) {
    return false;
  }

  // Calculate effective end date: endDate - autoReleaseDays days
  // This allows slots to become available before the official end date
  // Example: If endDate is 2025-01-31 and autoReleaseDays is 3, effective end is 2025-01-28
  const autoReleaseDays = blockout.autoReleaseDays || 0;
  const effectiveEndDate = dayjs(blockout.endDate).subtract(
    autoReleaseDays,
    "day"
  );

  // Check if booking date is within startDate to effectiveEndDate range (inclusive)
  // The "[]" parameter makes the range inclusive of both start and end dates
  const bookingDate = dayjs(date);
  if (
    !bookingDate.isBetween(blockout.startDate, effectiveEndDate, "day", "[]")
  ) {
    return false;
  }

  // Check pitch targeting based on blockout configuration
  if (blockout.targetSpecificPitches) {
    // Block specific pitches only - check if pitch.key is in targetPitches array
    // Note: targetPitches contains pitch.key values (Firebase keys), not pitch.id or pitch.name
    // This is because pitch.key is the unique identifier used in the database
    return blockout.targetPitches?.includes(pitch.key) || false;
  } else {
    // Block all pitches at the location (location-wide blockout)
    return true;
  }
}

/**
 * Check if a slot is blocked by any blockout and return the blocking blockout
 *
 * This function iterates through all available blockouts and returns the first one
 * that blocks the specified slot. If multiple blockouts apply, only the first match
 * is returned, but all blocking blockouts would prevent the slot from being bookable.
 *
 * @param date - The booking date in YYYY-MM-DD format
 * @param timeslot - The timeslot details (start/end times, rate, etc.)
 * @param pitch - The pitch object being checked
 * @returns The first blocking Blockout object, or null if the slot is not blocked
 *
 * @example
 * const blockout = checkBlockedSlot("2025-01-15", timeSlot, pitch);
 * if (blockout) {
 *   console.log("Blocked by:", blockout.reason);
 *   console.log("Effective period:", blockout.startDate, "to",
 *     dayjs(blockout.endDate).subtract(blockout.autoReleaseDays || 0, "day").format("YYYY-MM-DD"));
 * }
 */
function checkBlockedSlot(
  date: string,
  timeslot: SlotDetails,
  pitch: Pitch
): Blockout | null {
  return (
    props.blockouts.find((blockout) =>
      isBlockedByBlockout(blockout, date, pitch)
    ) || null
  );
}

function selectTimeslot(timeslot: SlotDetails, pitch: Pitch) {
  const { start } = timeslot;
  const dateSelected = props.date;
  const pitchId = getPitchId(pitch);
  let newTimeSlots = selectedTimeslots.value
    ? [...selectedTimeslots.value]
    : [];
  const found = newTimeSlots.findIndex(
    (slot) =>
      slot.start === start &&
      slot.pitch === pitchId &&
      slot.date === dateSelected
  );

  if (found !== -1) newTimeSlots.splice(found, 1);
  else
    newTimeSlots.push({
      ...timeslot,
      pitch: pitchId,
      date: dateSelected,
      typeOfSports: pitch.typeOfSports,
      automatePitchId: pitch.automatePitchId,
    });
  selectedTimeslots.value = useOrderBy(
    newTimeSlots,
    [
      "pitch",
      function (slot: BookingSlotDetails) {
        let add = slot.start.includes("pm") && slot.start !== "12pm" ? 12 : 0;
        return slot.start.length === 3
          ? parseInt(slot.start[0]) + add
          : parseInt(slot.start.slice(0, 2)) + add;
      },
    ],
    ["asc", "asc"]
  );

  emit("select", selectedTimeslots.value);
}

const theme = useTheme();
const accentColor = computed(() => {
  return theme.current.value.colors.accent;
});
</script>

<template>
  <template v-for="timeSlot in timeSlots">
    <v-row no-gutters justify="center" class="time-slot-row">
      <v-col cols="4" md="2">
        <div class="time__slot">
          {{ timeSlot.start }} - {{ timeSlot.end }}
          <sup v-if="timeSlot.duration !== 1">*</sup>
        </div>
      </v-col>
      <v-col cols="3" md="2">
        <div
          class="time__slot"
          :style="{
            color: timeSlot.color ? timeSlot.color : '#000',
          }"
        >
          ${{ (timeSlot.rate * 1.09).toFixed(2) }}
        </div>
      </v-col>
      <v-col cols="5" md="8">
        <div class="d-flex flex-row justify-center align-center">
          <template v-for="pitch in locationPitches" :key="pitch.key">
            <div class="flex-grow-1">
              <!-- Booked slot -->
              <div
                class="time__slot time__slot--button"
                v-if="checkBookedSlot(date, timeSlot, pitch)"
              >
                <v-icon color="red">mdi-close-circle</v-icon>
              </div>
              <!-- Blocked slot -->
              <div
                class="time__slot time__slot--button"
                v-else-if="checkBlockedSlot(date, timeSlot, pitch)"
              >
                <v-tooltip>
                  <template v-slot:activator="{ props }">
                    <v-icon color="gray" v-bind="props"
                      >mdi-block-helper</v-icon
                    >
                  </template>
                  <span>
                    Blocked:
                    {{
                      dayjs(
                        checkBlockedSlot(date, timeSlot, pitch)?.startDate
                      ).format("DD/MM/YYYY")
                    }}
                    -
                    {{
                      dayjs(checkBlockedSlot(date, timeSlot, pitch)?.endDate)
                        .subtract(
                          checkBlockedSlot(date, timeSlot, pitch)
                            ?.autoReleaseDays || 0,
                          "day"
                        )
                        .format("DD/MM/YYYY")
                    }}
                  </span>
                </v-tooltip>
              </div>
              <!-- Available slot -->
              <div
                class="time__slot time__slot--button"
                @click.prevent="selectTimeslot(timeSlot, pitch)"
                v-else
              >
                <v-icon
                  :color="accentColor"
                  v-if="checkSlot(date, timeSlot.start, pitch)"
                  >mdi-check-circle</v-icon
                >
                <v-icon color="#c9c9c9" v-else>mdi-check-circle</v-icon>
              </div>
            </div>
          </template>
        </div>
      </v-col>
    </v-row>
  </template>
</template>

<style lang="scss" scoped>
.time__slot {
  color: #000;
  padding: 10px 3px;
  font-size: 14px;
  text-align: center;

  &--button {
    cursor: pointer;
  }
}

.ivu-icon {
  color: green;
}

.time-slot-row {
  border-left: 1px solid #ebebeb;
  border-right: 1px solid #ebebeb;

  &:nth-child(odd) {
    background: #f9f9f9;
  }

  &:last-child {
    border-bottom: 1px solid #ebebeb;
  }
}
</style>
