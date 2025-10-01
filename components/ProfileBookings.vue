<script setup lang="ts">
import { onMounted } from 'vue'
import { useBookingsStore } from '../stores/bookings'
import { useBookedSlotsStore } from '../stores/bookedslots'

const bookingsStore = useBookingsStore()
const { myBookings } = storeToRefs(bookingsStore)
const bookedslotsStore = useBookedSlotsStore()
const { myBookedslots } = storeToRefs(bookedslotsStore)
const isLoading = ref(true)

const user = useAuthUser()

onMounted(async () => {
  isLoading.value = true
  await initialiseData()
  isLoading.value = false
})

async function initialiseData() {
  if (user.value) {
    await Promise.all([
      bookingsStore.fetchMyBookings(user.value.email),
      bookedslotsStore.fetchMyBookedslots(user.value.email)
    ])
  }
}
</script>

<template>
  <section class="profileBookings">
    <div v-if="isLoading && !myBookings.length && !Object.keys(myBookedslots).length"
      style="display: flex; justify-content: center; align-items: center; min-height: 200px;">
      <VProgressCircular indeterminate color="#0A8A44" />
    </div>
    <template v-if="myBookings.length > 0 && Object.keys(myBookedslots).length > 0">
      <h5>Bookings</h5>
      <div class="content">
        <template v-for="booking in myBookings">
          <ProfileBookingCard :booking="booking" />
        </template>
      </div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.profileBookings {
  .content {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    column-gap: 1rem;
    row-gap: 1rem;
  }
}
</style>