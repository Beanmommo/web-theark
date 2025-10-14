<script setup lang="ts">
import { ref } from 'vue'
import { useLocationsStore } from '~/stores/locations'
import { storeToRefs } from 'pinia'

const locationsStore = useLocationsStore()
const { locations } = storeToRefs(locationsStore)
const sportsStore = useSportsStore()
const { activeSport, activeSportVenues } = storeToRefs(sportsStore)

const router = useRouter()
const selectedVenue = ref()
const selectedDate = ref()

function clickHandler() {
  let url = `/${activeSport.value?.slug}/booking`
  if (selectedVenue.value || selectedDate.value) url += '?'
  if (selectedVenue.value) url += `venue=${selectedVenue.value}`
  if (selectedVenue.value && selectedDate.value) url += '&'
  if (selectedDate.value) {
    const date = format(selectedDate.value)
    url += `date=${date}`
  }
  navigateTo(url)
}

function format(date: Date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

const backgroundImage = computed(() => activeSport.value?.backgroundImage || '')
</script>


<template>
  <section class="sectionQuickBooking" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="sectionContainer">
      <div class="quickBooking">
        <h2>{{ activeSport?.name }} Quick Booking</h2>
        <div class="form__container">
          <FieldInputSelect v-model="selectedVenue" placeholder="Venue" :options="activeSportVenues" />
          <FieldInputDate v-model="selectedDate" placeholder="Date" />
          <Button class="form__container--button" @click="clickHandler">Search</Button>
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
</style>