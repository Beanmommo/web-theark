<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useBlockoutsStore } from '~/stores/blockouts';
import { storeToRefs } from 'pinia';
type DisabledDate = { start: Date, end: Date }

const emit = defineEmits(['click'])

const dayjs = useDayjs()
const route = useRoute()
const blockoutsStore = useBlockoutsStore()
const { blockouts } = storeToRefs(blockoutsStore)

const minDate = ref()
const maxDate = ref()
const disabledDates = ref([] as DisabledDate[])
const selectedDate = ref()

const attributes = ref([
  {
    highlight: {
      fillMode: 'outline'
    },
    dates: new Date()
  },
]);

onMounted(() => {
  initialiseDate()
})

watch(() => route.query.venue, (newValue) => {
  initialiseDate()
})

function initialiseDate() {
  disabledDates.value = getDisabledDates(route.query.venue as string)
  minDate.value = getMinDate()
  maxDate.value = dayjs().add(1, 'month').format()
  if (route.query.date && !isOutsideRange(route.query.date as string) && !isDisabledDates(route.query.date as string)) {
    const dateString: string = route.query.date as string
    selectedDate.value = dateString
    attributes.value = [{ highlight: { fillMode: 'solid' }, dates: dayjs(dateString, 'DD-MM-YYYY').toDate() }]
    emit('click', selectedDate.value)
  }
  if (isDisabledDates(route.query.date as string)) {
    selectedDate.value = null
    attributes.value = []
    emit('click', selectedDate.value)
  }
}

function getDisabledDates(location: string) {
  let disabledDates: DisabledDate[] = []
  const blockoutDates = blockouts.value.filter(blockout => blockout.location === location)
  if (blockoutDates.length > 0)
    disabledDates = blockoutDates.map(blockout => {
      return {
        start: dayjs(blockout.startDate).toDate(),
        end: dayjs(blockout.endDate).toDate()
      }
    })
  return disabledDates
}

function getMinDate() {
  const end = dayjs(
    `${dayjs().format("YYYY-MM-DD")} 23:00`,
    "YYYY-MM-DD hh:mm"
  );
  const min = dayjs().add(3, "hour");
  if (min.isSameOrAfter(end)) {
    return dayjs().add(1, "day").format();
  } else {
    return dayjs().format();
  }
}

function dayClickHandler(calendarDay: any) {
  if (isOutsideRange(calendarDay.id)) return;
  if (isDisabledDates(calendarDay.id)) return;
  selectedDate.value = calendarDay.id
  attributes.value = [{ highlight: { fillMode: 'solid' }, dates: calendarDay.date }]
  emit('click', selectedDate.value)
}

function isDisabledDates(date: string) {
  const day = dayjs(date, 'YYYY-MM-DD')
  return disabledDates.value.some(disabledDate => day.isBetween(disabledDate.start, disabledDate.end, 'day', '[]'))
}

function isOutsideRange(date: string) {
  const day = dayjs(date, 'YYYY-MM-DD')
  const min = dayjs(minDate.value)
  const max = dayjs(maxDate.value)
  return day.isBefore(min, 'day') || day.isAfter(max, 'day')
}
</script>


<template>
  <ClientOnly>
    <VCalendar :min-date="minDate" :max-date="maxDate" :disabled-dates="disabledDates" :attributes="attributes"
      @dayclick="dayClickHandler" expanded color="gray" />
  </ClientOnly>
</template>