<script setup lang="ts">
import { useTheme } from 'vuetify';
import { useBookedSlotsStore } from '../stores/bookedslots';
import type { Booking, BookedSlot } from '../types/data'

const props = defineProps({
  booking: {
    type: Object as PropType<Booking>,
    required: true
  }
})

const dayjs = useDayjs()
const bookedslotsStore = useBookedSlotsStore()
const { myBookedslots } = storeToRefs(bookedslotsStore)

const bookingSlots = ref<BookedSlot[]>([])
onMounted(() => {
  initialiseData()
})

function initialiseData() {
  if (!props.booking.slots) return
  props.booking.slots.forEach(slotKey => {
    if (!myBookedslots.value[slotKey]) return
    bookingSlots.value.push(myBookedslots.value[slotKey])
  })
}

const theme = useTheme()
const accentColor = computed(() => {
  return theme.current.value.colors.accent
})
</script>

<template>
  <div class="profileBookingCard">
    <img src="/Icon/activity_booking_icon.svg" alt="Booking Icon" class="icon" :style="{ background: accentColor }" />
    <div class="location__date">
      <b>{{ booking.location }}</b>
      <div>{{ dayjs(booking.date).format('DD MMM YYYY') }}</div>
    </div>
    <div class="total__slots">
      <div>${{ booking.totalPayable ? booking.totalPayable : booking.amount }}</div>
      <template v-for="slot in bookingSlots">
        <div class="pitch">Pitch {{ slot.pitch }} - {{ slot.start }} to {{ slot.end }}</div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.profileBookingCard {
  display: grid;
  align-items: center;
  grid-template-columns: 15% 15% 1fr;
  box-shadow: $box-shadow;
  padding: $margin;

  .icon {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    padding: $unit;
  }
}

.total__slots {
  justify-self: end;
  text-align: right
}

.pitch {
  font-size: 0.7rem;
}
</style>