<script setup lang="ts">
import { useBookedSlotsStore } from '~/stores/bookedslots'
import { useHolidaysStore } from '~/stores/holidays';
import { storeToRefs } from 'pinia';
import type { Pitch, Timeslot, Holiday, SlotDetails, BookingSlotDetails, Venue } from '../types/data'
import { type Dayjs } from 'dayjs'

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
    type : Object as PropType<Venue>,
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

onMounted(async () =>
{
  reloadData()
})

const formattedDate = computed(() => dayjs(props.date).format("DD MMM YYYY"))

async function reloadData()
{
  loading.value = true
  initialiseTimeslots()
  if (props.location)
    await initialiseBookedSlots(props.date, props.location)
  loading.value = false
}

async function initialiseBookedSlots(date: string, location: string)
{
  await bookedSlotsStore.fetchBookedSlotsByDate(date, location, props.sport)
}

function initialiseTimeslots()
{
  timeSlots.value = []
  let end = dayjs(`${props.date} 23:00`, "YYYY-MM-DD hh:mm");
  if (props.locationData.tillMidnight)
    end= dayjs(`${props.date}`, "YYYY-MM-DD").add(1, "day");
  const start = dayjs(`${props.date} 08:00`, "YYYY-MM-DD hh:mm");
  const date = props.date
  let current = dayjs()
  if (current.isBefore(start))
    current = start;

  const isHoliday = checkIsHoliday(date, holidays.value);

  while (current.isBefore(end))
  {
    const slotDetails = checkSlotDetail(current, date, isHoliday);
    if (!slotDetails)
    {
      current = current.add(1, "hour");
      continue;
    }
    let addDuration = 1;
    if (!slotDetails)
    {
      current = current.add(addDuration, "hour");
      return;
    }
    if (slotDetails.timePerSlot !== "1")
      addDuration = parseInt(slotDetails.timePerSlot);

    const slotEnd = dayjs(`${date} ${slotDetails.endTime}`, "YYYY-MM-DD hh:mm");
    if (slotEnd.diff(current, "hours", true) % parseInt(slotDetails.timePerSlot) !== 0)
      addDuration = 1

    if (dayjs(current).add(addDuration, "h").isSameOrBefore(end) === false)
      addDuration = 1

    let rate = parseInt(slotDetails.rate) * addDuration;
    if (slotDetails.newRate)
    {
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
    current = current.add(addDuration, "hour");
  }
}

function checkIsHoliday(dateSelected: string, holidayList: Holiday[])
{
  const date = dayjs(dateSelected, "YYYY-MM-DD").format('DD-MM-YYYY')
  return (
    holidayList &&
    holidayList.find(holiday => date === holiday.date) !== undefined
  );
}

function checkSlotDetail(currentTime: Dayjs, dateSelected: string, isHoliday: boolean)
{
  // Normalize sport slug to lowercase, default to "futsal" if null/undefined
  const normalizedSport = props.sport?.toLowerCase() || 'futsal';

  if (isHoliday)
    return props.locationTimeslots.find(timeslot => {
      // Check typeOfSports match for holiday slots
      const timeslotSport = timeslot.typeOfSports?.toLowerCase() || 'futsal';
      return timeslot.type === 'Holiday' && timeslotSport === normalizedSport;
    });

  return props.locationTimeslots.find(timeslot =>
  {
    if (timeslot.days.includes(dayjs(dateSelected).format("ddd")) && timeslot.type !== "Holiday")
    {
      // Check typeOfSports match
      const timeslotSport = timeslot.typeOfSports?.toLowerCase() || 'futsal';
      if (timeslotSport !== normalizedSport) {
        return false;
      }

      const start = dayjs(`${dateSelected} ${timeslot.startTime}`, "YYYY-MM-DD hh:mm");
      const end = dayjs(`${dateSelected} ${timeslot.endTime}`, "YYYY-MM-DD hh:mm");
      return currentTime.isSameOrAfter(start) && currentTime.isBefore(end);
    }
    return false;
  });
}

function selectHandler(selectedTimeslots: BookingSlotDetails[])
{
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