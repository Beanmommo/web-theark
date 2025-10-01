<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { Pitch, BookedSlot, SlotDetails, BookingSlotDetails } from '../types/data'

const dayjs = useDayjs()
const selectedTimeslots = ref([] as BookingSlotDetails[])

const props = defineProps({
  locationPitches: {
    type: Array<Pitch>,
    required: true
  },
  timeSlots: Array<SlotDetails>,
  location: { type: String, required: true },
  date: { type: String, required: true },
  bookedSlots: { type: Array<BookedSlot>, required: true }
})

const emit = defineEmits(['select'])

watch(() => props.date, async () => reloadData())

watch(() => props.location, () => reloadData())

function reloadData() {
  selectedTimeslots.value = []
}

function checkBookedSlot(date: string, timeslot: SlotDetails, pitchIndex: number) {
  const formattedDate = dayjs(date, "YYYY-MM-DD").format();
  const found = props.bookedSlots.find(slot =>
    slot.pitch === pitchIndex + 1 &&
    (slot.start === timeslot.start || slot.end === timeslot.end) &&
    dayjs(slot.date).isSame(formattedDate, "day")
  );
  if (found !== undefined)
    console.log(found)
  return found !== undefined
}

function checkSlot(date: string, start: string, pitchIndex: number) {
  const formattedDate = dayjs(date, "YYYY-MM-DD").format();
  return (
    selectedTimeslots.value &&
    selectedTimeslots.value.findIndex((slot) => slot.start === start && slot.pitch === pitchIndex + 1 && dayjs(slot.date).isSame(formattedDate, "day")) !== -1
  );
}

function selectTimeslot(timeslot: SlotDetails, pitchIndex: number) {
  const { start } = timeslot;
  const dateSelected = props.date
  let newTimeSlots = selectedTimeslots.value ? [...selectedTimeslots.value] : [];
  const found = newTimeSlots.findIndex(slot =>
    slot.start === start &&
    slot.pitch === pitchIndex + 1 &&
    slot.date === dateSelected);

  if (found !== -1)
    newTimeSlots.splice(found, 1);
  else
    newTimeSlots.push({
      ...timeslot,
      pitch: pitchIndex + 1,
      date: dateSelected,
      typeOfSports: props.locationPitches[pitchIndex].typeOfSports
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

  emit('select', selectedTimeslots.value)
}

const theme = useTheme()
const accentColor = computed(() => {
  return theme.current.value.colors.accent
})
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
        <div class="time__slot" :style="{
          color: timeSlot.color ? timeSlot.color : '#000',
        }">
          ${{ (timeSlot.rate * 1.09).toFixed(2) }}
        </div>
      </v-col>
      <v-col cols="5" md="8">
        <div class="d-flex flex-row justify-center align-center">
          <template v-for="(_, ind) in locationPitches">
            <div class="flex-grow-1">
              <div class="time__slot time__slot--button" v-if="checkBookedSlot(date, timeSlot, ind)">
                <v-icon color="red">mdi-close-circle</v-icon>
              </div>
              <div class="time__slot time__slot--button" @click.prevent="selectTimeslot(timeSlot, ind)" v-else>
                <v-icon :color="accentColor" v-if="checkSlot(date, timeSlot.start, ind)">mdi-check-circle</v-icon>
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