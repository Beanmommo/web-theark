<script setup lang="ts">
import { onMounted } from 'vue'
import { useBookingsStore } from '../stores/bookings'
import { useBookedSlotsStore } from '../stores/bookedslots'

const bookingsStore = useBookingsStore()
const { myBookings } = storeToRefs(bookingsStore)
const bookedslotsStore = useBookedSlotsStore()
const { myBookedslots } = storeToRefs(bookedslotsStore)

const user = useAuthUser()

onMounted(() =>
{
  initialiseData()
})

async function initialiseData()
{
  if (user.value)
  {
    await Promise.all([
      bookingsStore.fetchMyBookings(user.value.email),
      bookedslotsStore.fetchMyBookedslots(user.value.email)
    ])
  }
}
</script>

<template>
  <section class="profileBookings">
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
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>