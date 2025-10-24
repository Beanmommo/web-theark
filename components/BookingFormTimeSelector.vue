<script setup lang="ts">
import { useBookedSlotsStore } from '~/stores/bookedslots'
import { useHolidaysStore } from '~/stores/holidays';
import { storeToRefs } from 'pinia';
import type { Pitch, Timeslot, Holiday, SlotDetails, BookingSlotDetails, Venue } from '../types/data'

const props = defineProps({
  date: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  locationPitches: {
    type: Array<Pitch>,
    default: () => []
  },
  locationTimeslots: {
    type: Array<Timeslot>,
    required: true
  },
  locationData: {
    type: Object as PropType<Venue>,
    required: true
  },
  sport: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['select'])

const dayjs = useDayjs()
const holidaysStore = useHolidaysStore()
const { holidays } = storeToRefs(holidaysStore)
const bookedSlotsStore = useBookedSlotsStore()
const { bookedslots } = storeToRefs(bookedSlotsStore)

const timeSlots = ref([] as SlotDetails[])
const loading = ref(false)

watch(() => props.date, async () => reloadData())

watch(() => props.location, () => reloadData())

onMounted(async () => {
  reloadData()
})

const formattedDate = computed(() => dayjs(props.date).format("DD MMM YYYY"))

async function reloadData() {
  loading.value = true
  initialiseTimeslots()
  if (props.location)
    await initialiseBookedSlots(props.date, props.location)
  loading.value = false
}

async function initialiseBookedSlots(date: string, location: string) {
  await bookedSlotsStore.fetchBookedSlotsByDate(date, location, props.sport)
}

function initialiseTimeslots() {
  timeSlots.value = []
  const date = props.date
  const isHoliday = checkIsHoliday(date, holidays.value);
  const normalizedSport = props.sport?.toLowerCase() || 'futsal';

  // Get applicable timeslots for this date and sport
  const applicableTimeslots = props.locationTimeslots.filter(timeslot => {
    // Check if it's a holiday slot and we're on a holiday
    if (isHoliday && timeslot.type === 'Holiday') {
      const timeslotSport = timeslot.typeOfSports?.toLowerCase() || 'futsal';
      return timeslotSport === normalizedSport;
    }

    // Check if it's a regular slot for the correct day and sport
    if (!isHoliday && timeslot.type !== 'Holiday' && timeslot.days.includes(dayjs(date).format("ddd"))) {
      const timeslotSport = timeslot.typeOfSports?.toLowerCase() || 'futsal';
      if (timeslotSport !== normalizedSport) {
        return false;
      }

      // Check if booking date is on or after the timeslot's startDate
      if (timeslot.startDate) {
        const startDate = dayjs(timeslot.startDate, "YYYY-MM-DD");
        if (dayjs(date).isBefore(startDate, "day")) {
          return false;
        }
      }

      return true;
    }

    return false;
  });

  // Sort applicable timeslots by startTime to handle multiple instances (Peak/Off-Peak)
  // When there are overlapping timeslots, we'll use the one with the earliest startTime
  const sortedTimeslots = applicableTimeslots.sort((a, b) => {
    const timeA = dayjs(`2000-01-01 ${a.startTime}`, "YYYY-MM-DD hh:mm");
    const timeB = dayjs(`2000-01-01 ${b.startTime}`, "YYYY-MM-DD hh:mm");
    return timeA.diff(timeB);
  });

  // Track which time periods have been covered to avoid overlaps
  const coveredPeriods: Array<{ start: string; end: string }> = [];

  // Generate timeslots based on each applicable timeslot's startTime and endTime
  sortedTimeslots.forEach(slotDetails => {
    let current = dayjs(`${date} ${slotDetails.startTime}`, "YYYY-MM-DD hh:mm");
    const slotEnd = dayjs(`${date} ${slotDetails.endTime}`, "YYYY-MM-DD hh:mm");

    while (current.isBefore(slotEnd)) {
      // Check if this time period is already covered by an earlier timeslot
      const isCovered = coveredPeriods.some(period => {
        const periodStart = dayjs(`${date} ${period.start}`, "YYYY-MM-DD hh:mm");
        const periodEnd = dayjs(`${date} ${period.end}`, "YYYY-MM-DD hh:mm");
        return current.isSameOrAfter(periodStart) && current.isBefore(periodEnd);
      });

      if (isCovered) {
        current = current.add(1, "hour");
        continue;
      }

      let addDuration = 1;
      if (slotDetails.timePerSlot !== "1")
        addDuration = parseInt(slotDetails.timePerSlot);

      // Check if the slot fits within the timeslot boundaries
      if (slotEnd.diff(current, "hours", true) % parseInt(slotDetails.timePerSlot) !== 0)
        addDuration = 1

      // Check if adding the duration would exceed the slot end time
      if (dayjs(current).add(addDuration, "h").isAfter(slotEnd))
        break;

      let rate = parseInt(slotDetails.rate) * addDuration;
      if (slotDetails.newRate) {
        const dateToday = dayjs(date);
        const startDate = dayjs(slotDetails.startDate, "YYYY-MM-DD");
        if (dateToday.isSameOrAfter(startDate, "day"))
          rate = parseInt(slotDetails.newRate) * addDuration;
      }

      const timeSlot = {
        start: dayjs(current).format("ha"),
        end: dayjs(current).add(addDuration, "h").format("ha"),
        rate,
        duration: addDuration,
        color: slotDetails.color ? slotDetails.color : null,
        type: slotDetails.type,
      };
      timeSlots.value.push(timeSlot);

      // Track this period as covered
      coveredPeriods.push({
        start: dayjs(current).format("HH:mm"),
        end: dayjs(current).add(addDuration, "h").format("HH:mm"),
      });

      current = current.add(addDuration, "hour");
    }
  });
}

function checkIsHoliday(dateSelected: string, holidayList: Holiday[]) {
  const date = dayjs(dateSelected, "YYYY-MM-DD").format('DD-MM-YYYY')
  return (
    holidayList &&
    holidayList.find(holiday => date === holiday.date) !== undefined
  );
}

function selectHandler(selectedTimeslots: BookingSlotDetails[]) {
  emit('select', selectedTimeslots)
}
</script>

<template>
  <div class="bookingFormTimeSelector">
    <Loading message="Loading Booking Schedule" v-if="loading" />
    <h5>Available schedule ({{ formattedDate }})</h5>

    <!-- Time Selector Header-->
    <BookingFormTimeSelectorHeader :locationPitches="locationPitches" />

    <!-- Time Selector Table-->
    <BookingFormTimeSelectorTable :locationPitches="locationPitches" :timeSlots="timeSlots" :date="date"
      :location="location" :bookedSlots="bookedslots" @select="selectHandler" />
  </div>
</template>

<style lang="scss" scoped>
.bookingFormTimeSelector {
  margin-top: 20px;
}
</style>