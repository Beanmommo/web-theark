<script setup lang="ts">
import { useTheme } from 'vuetify';
import { useBookedSlotsStore } from '../stores/bookedslots';
import type { Booking, BookedSlot } from '../types/data'
import { VTooltip } from 'vuetify/components';

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

const iconColor = computed(() => {
  if (props.booking.typeOfSports === 'futsal') {
    return '#0A8A44'
  } else if (props.booking.typeOfSports === 'pickleball') {
    return '#5A9AD2'
  }
  return accentColor.value
})

const formatSport = computed(() => {
  return props.booking.typeOfSports.charAt(0).toUpperCase() + props.booking.typeOfSports.slice(1)
})

const showInvoice = ref(false)

function handleClickInvoice() {
  showInvoice.value = true
}

function handleClickCancel() {

}

const isCancellable = computed(() => {
  return dayjs().isBefore(dayjs(props.booking.date).subtract(72, 'hours'))
})
</script>

<template>
  <div class="profileBookingCard">
    <img src="/Icon/activity_booking_icon.svg" alt="Booking Icon" class="icon" :style="{ background: iconColor }" />
    <div class="location__date">
      <b>{{ booking.location }}</b>
      <div>{{ dayjs(booking.date).format('DD MMM YYYY') }}</div>
    </div>
    <div class="sport">
      {{ formatSport }}
    </div>
    <div class="total__slots">
      <div>${{ booking.totalPayable ? booking.totalPayable : booking.amount }}</div>
      <template v-for="slot in bookingSlots">
        <div class="pitch">Pitch {{ slot.pitch }} - {{ slot.start }} to {{ slot.end }}</div>
      </template>
    </div>
    <div class="action">
      <div>
        <VBtn icon="mdi-dots-vertical" density="compact" variant="plain" />
        <VMenu activator="parent">
          <VList density="compact">
            <VTooltip v-if="!isCancellable" location="right">
              <template #activator="{ props }">
                <div v-bind="props">
                  <VListItem disabled>
                    <template #prepend>
                      <VIcon icon="mdi-close" color="red" />
                    </template>
                    <VListItemTitle color="red">
                      Cancel Booking
                    </VListItemTitle>
                  </VListItem>
                </div>
              </template>
              <span>Cancellation is not allowed 72 hours before the booking date</span>
            </VTooltip>
            <VListItem v-else @click="handleClickCancel">
              <template #prepend>
                <VIcon icon="mdi-close" color="red" />
              </template>
              <VListItemTitle color="red">
                Cancel Booking
              </VListItemTitle>
            </VListItem>
            <VListItem @click="handleClickInvoice">
              <template #prepend>
                <VIcon icon="mdi-invoice-text-outline" />
              </template>
              <VListItemTitle>View Invoice</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </div>
    </div>
  </div>
  <template v-if="booking.invoiceKey">
    <InvoiceOverlay :modelValue="showInvoice" :invoiceKey="booking.invoiceKey" @update:modelValue="showInvoice = false"
      :sport="booking.typeOfSports" />
  </template>
</template>

<style lang="scss">
.profileBookingCard {
  display: grid;
  align-items: center;
  grid-template-columns: 100px 30% 15% 1fr 50px;
  column-gap: 1rem;
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

.action {
  justify-self: end;
}
</style>