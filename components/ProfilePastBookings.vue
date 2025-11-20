<script setup lang="ts">
import { useBookingsStore } from "../stores/bookings";
import { useBookedSlotsStore } from "../stores/bookedslots";

const bookingsStore = useBookingsStore();
const { myBookings } = storeToRefs(bookingsStore);
const bookedslotsStore = useBookedSlotsStore();
const { myBookedslots } = storeToRefs(bookedslotsStore);

const dayjs = useDayjs();

// Filter for past bookings (before today)
const pastBookings = computed(() => {
  return myBookings.value.filter((booking) => {
    return dayjs(booking.date)
      .tz("Asia/Singapore")
      .isBefore(dayjs().tz("Asia/Singapore"), "day");
  });
});
</script>

<template>
  <section class="profilePastBookings">
    <h5>Past Bookings</h5>
    <div v-if="pastBookings.length > 0" class="content">
      <template v-for="booking in pastBookings" :key="booking.key">
        <ProfileBookingCard :booking="booking" />
      </template>
    </div>
    <div v-else class="empty-state">
      <p>No past bookings</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.profilePastBookings {
  margin-top: 2rem;

  .content {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    column-gap: 1rem;
    row-gap: 1rem;
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: #666;
  }
}
</style>
