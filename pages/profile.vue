<script setup lang="ts">
import { useCreditsStore } from "~/stores/credits";
import { usePitchesStore } from "~/stores/pitches";
import { useLocationsStore } from "~/stores/locations";

definePageMeta({
  middleware: "auth",
});

const user = useAuthUser();
const creditsStore = useCreditsStore();
const pitchesStore = usePitchesStore();
const locationsStore = useLocationsStore();

// Fetch necessary data - works for both SSR and client-side navigation
await Promise.all([
  useAsyncData(() => pitchesStore.fetchPitches()),
  useAsyncData(() => locationsStore.fetchLocations()),
]);

// Fetch user-specific credits on mount (requires auth)
onMounted(async () => {
  await creditsStore.fetchUserCreditsAndRefunds();
});

// Toggle for showing past bookings
const showPastBookings = ref(false);

function togglePastBookings() {
  showPastBookings.value = !showPastBookings.value;
}
</script>

<template>
  <PageBannerProfile>
    <ClientOnly fallback="Hi!"> Hi {{ user?.displayName }}! </ClientOnly>
  </PageBannerProfile>
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
        {{ showPastBookings ? "Hide Past Bookings" : "View Past Bookings" }}
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
