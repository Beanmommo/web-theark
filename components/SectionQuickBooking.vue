<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useLocationsStore } from "~/stores/locations";
import { useBlockoutsStore } from "~/stores/blockouts";
import { storeToRefs } from "pinia";

const route = useRoute();
const locationsStore = useLocationsStore();
const { locations } = storeToRefs(locationsStore);
const sportsStore = useSportsStore();
const { sports, activeSport, activeSportVenues } = storeToRefs(sportsStore);
const blockoutsStore = useBlockoutsStore();
const { blockouts } = storeToRefs(blockoutsStore);

const dayjs = useDayjs();
const selectedVenue = ref();
const selectedDate = ref();

// Get sport from route or activeSport for SSR compatibility
const currentSport = computed(() => {
  // First try activeSport (set by parent page)
  if (activeSport.value) return activeSport.value;

  // Fallback: get from route params and search in sports array
  const sportSlug = route.params.sportSlug as string;
  if (sportSlug && sports.value.length > 0) {
    return sports.value.find((sport) => sport.slug === sportSlug);
  }

  return null;
});

// Fetch blockouts on mount
onMounted(async () => {
  await blockoutsStore.fetchBlockouts();
});

// Compute disabled dates based on selected venue and location-wide blockouts
const disabledDates = computed(() => {
  if (!selectedVenue.value) return [];

  // Find the location key for the selected venue name
  const selectedLocation = locations.value.find(
    (loc) => loc.name === selectedVenue.value
  );

  if (!selectedLocation) return [];

  // Filter blockouts for this location that are location-wide (not pitch-specific)
  const locationBlockouts = blockouts.value.filter(
    (blockout) =>
      blockout.location === selectedLocation.name &&
      !blockout.targetSpecificPitches
  );

  // Convert blockouts to array of disabled dates
  const disabled: Date[] = [];
  locationBlockouts.forEach((blockout) => {
    const start = dayjs(blockout.startDate);
    const end = dayjs(blockout.endDate);
    let current = start;

    // Add each date in the range to disabled array
    while (current.isSameOrBefore(end, "day")) {
      disabled.push(current.toDate());
      current = current.add(1, "day");
    }
  });

  return disabled;
});

function clickHandler() {
  let url = `/${currentSport.value?.slug}/booking`;
  if (selectedVenue.value || selectedDate.value) url += "?";
  if (selectedVenue.value) url += `venue=${selectedVenue.value}`;
  if (selectedVenue.value && selectedDate.value) url += "&";
  if (selectedDate.value) {
    const date = format(selectedDate.value);
    url += `date=${date}`;
  }
  navigateTo(url);
}

function format(date: Date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

const backgroundImage = computed(() => {
  return currentSport.value?.backgroundImage || "";
});

// Check if current sport is bookable
const isBookable = computed(() => {
  if (!currentSport.value) return false;
  return sportsStore.isBookable(currentSport.value);
});

// Format publish date for display
const publishDate = computed(() => {
  if (!currentSport.value?.websitePublishDate) return "";
  return dayjs(currentSport.value.websitePublishDate).format("MMMM D, YYYY");
});
</script>

<template>
  <section
    class="sectionQuickBooking"
    :style="{ backgroundImage: `url(${backgroundImage})` }"
  >
    <div class="sectionContainer">
      <!-- Coming Soon Overlay -->
      <div v-if="!isBookable" class="coming-soon-overlay">
        <div class="coming-soon-content">
          <VIcon icon="mdi-calendar-clock" size="80" class="coming-soon-icon" />
          <h2>{{ currentSport?.name }} Coming Soon!</h2>
          <p class="publish-date">Available from {{ publishDate }}</p>
          <p class="description">
            We're excited to bring {{ currentSport?.name }} to The Ark. Stay
            tuned!
          </p>
        </div>
      </div>

      <!-- Regular Booking Form -->
      <div v-else class="quickBooking">
        <h2>{{ currentSport?.name }} Quick Booking</h2>
        <div class="form__container">
          <FieldInputSelect
            v-model="selectedVenue"
            placeholder="Venue"
            :options="activeSportVenues"
          />
          <FieldInputDate
            v-model="selectedDate"
            placeholder="Date"
            :disabled-dates="disabledDates"
          />
          <Button class="form__container--button" @click="clickHandler"
            >Search</Button
          >
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.sectionQuickBooking {
  background-repeat: no-repeat;
  background-size: cover;
  height: 500px;
  display: grid;
  justify-items: center;
  align-items: center;
}

.sectionContainer {
  max-width: $main-max;
  width: 100%;
}

.quickBooking {
  background: $functional-white;
  min-height: 180px;
  border-radius: 8px;
  padding: $p-margin;
  max-width: $main-max;
  margin: 0 $margin;

  @include tablet {
    margin: 0;
  }

  h2 {
    font-size: 1.8rem;
    font-weight: 500;
    margin: $unit;
  }
}

.form__container {
  display: grid;
  grid-auto-flow: row;
  grid-gap: $margin * 2;
  align-items: center;
  padding: 0 $margin;
  margin-bottom: $p-margin;

  &--button {
    margin-top: $unit;
    height: 50px;
  }

  @include md {
    grid-auto-flow: column;
    grid-template-columns: 40% 40% 1fr;
  }
}

.coming-soon-overlay {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  min-height: 180px;
  border-radius: 8px;
  padding: $p-margin * 2;
  max-width: $main-max;
  margin: 0 $margin;
  display: flex;
  align-items: center;
  justify-content: center;

  @include tablet {
    margin: 0;
    padding: $p-margin * 3;
  }
}

.coming-soon-content {
  text-align: center;
  max-width: 600px;

  .coming-soon-icon {
    color: #999;
    margin-bottom: $margin * 2;
    opacity: 0.8;
  }

  h2 {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: $margin;
    color: $functional-black;

    @include mobile {
      font-size: 2rem;
    }
  }

  .publish-date {
    font-size: 1.3rem;
    font-weight: 500;
    color: #666;
    margin-bottom: $margin * 2;
  }

  .description {
    font-size: 1.1rem;
    color: #888;
    line-height: 1.6;
  }
}
</style>
