<script setup lang="ts">
import { onMounted } from "vue";
import { useBookingsStore } from "../stores/bookings";
import { useBookedSlotsStore } from "../stores/bookedslots";

const bookingsStore = useBookingsStore();
const { myBookings } = storeToRefs(bookingsStore);
const bookedslotsStore = useBookedSlotsStore();
const { myBookedslots } = storeToRefs(bookedslotsStore);
const isLoading = ref(true);

const user = useAuthUser();
const dayjs = useDayjs();

onMounted(async () => {
  isLoading.value = true;
  await initialiseData();
  isLoading.value = false;
});

async function initialiseData() {
  if (user.value) {
    await bookingsStore.fetchMyBookings(user.value.email),
      await bookedslotsStore.fetchMyBookedslots(user.value.email);
  }
}

// Filter for upcoming bookings (today and future)
const upcomingBookings = computed(() => {
  return myBookings.value.filter((booking) => {
    return dayjs(booking.date)
      .tz("Asia/Singapore")
      .isSameOrAfter(dayjs().tz("Asia/Singapore"), "day");
  });
});
</script>

<template>
  <section class="profileUpcomingBookings">
    <div
      v-if="isLoading"
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      "
    >
      <VProgressCircular indeterminate color="#0A8A44" />
    </div>
    <template v-if="!isLoading">
      <h5>Upcoming Bookings</h5>
      <div v-if="upcomingBookings.length > 0" class="content">
        <template v-for="booking in upcomingBookings" :key="booking.key">
          <ProfileBookingCard :booking="booking" />
        </template>
      </div>
      <div v-else class="empty-state">
        <p>No upcoming bookings</p>
      </div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.profileUpcomingBookings {
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
