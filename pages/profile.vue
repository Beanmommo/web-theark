<script setup lang="ts">
import { useCreditsStore } from '~/stores/credits'

definePageMeta({
  middleware: 'auth'
})

const user = useAuthUser()
const creditsStore = useCreditsStore()

// Fetch credits once during SSR/hydration
await useAsyncData('credits', async () => {
  await creditsStore.fetchUserCredits()
  await creditsStore.fetchUserCreditRefunds()
})

// Toggle for showing past bookings
const showPastBookings = ref(false)

function togglePastBookings() {
  showPastBookings.value = !showPastBookings.value
}

</script>

<template>
  <PageBannerProfile>Hi {{ user?.displayName }}!</PageBannerProfile>
  <SectionContainer>
    <ProfileUserDetails />
    <ProfileUpcomingBookings />

    <div class="past-bookings-toggle">
      <VBtn
        @click="togglePastBookings"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-history"
      >
        {{ showPastBookings ? 'Hide Past Bookings' : 'View Past Bookings' }}
      </VBtn>
    </div>

    <ProfilePastBookings v-if="showPastBookings" />
  </SectionContainer>

</template>

<style scoped>
.past-bookings-toggle {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
</style>