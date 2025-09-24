<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGoTo } from 'vuetify'
import type { GroupedTimeslots, Invoice } from '~/types/data';
import { useLocationsStore } from '~/stores/locations'
import { useTimeslotsStore } from "~/stores/timeslots";
import { usePitchesStore } from "~/stores/pitches";
import { useHolidaysStore } from '~/stores/holidays';
import { useBlockoutsStore } from '~/stores/blockouts';
import { usePromoCodesStore } from '~/stores/promocodes';

const locationsStore = useLocationsStore()
const timeslotsStore = useTimeslotsStore()
const pitchesStore = usePitchesStore()
const holidaysStore = useHolidaysStore()
const blockoutsStore = useBlockoutsStore()
const promocodesStore = usePromoCodesStore()
const creditsStore = useCreditsStore();

await Promise.all([
  useAsyncData('locations', () => locationsStore.fetchLocations()),
  useAsyncData('timeslots', () => timeslotsStore.fetchTimeslots()),
  useAsyncData('pitches', () => pitchesStore.fetchPitches()),
  useAsyncData('holidays', () => holidaysStore.fetchHolidays()),
  useAsyncData('blockouts', () => blockoutsStore.fetchBlockouts()),
  useAsyncData('promocodes', () => promocodesStore.fetchPromoCodes()),
  useAsyncData('credits', () => creditsStore.fetchUserCredits())
])


enum Step {
  SelectionPage = 1,
  AuthPage = 2,
  PaymentPage = 3,
  QRPage = 4
}

const route = useRoute();
const goTo = useGoTo();
const venue = ref()
const step = ref(1)
const groupedTimeslots = ref({} as GroupedTimeslots)
const user = useAuthUser()
const invoiceData = ref({} as Invoice)

onMounted(() => {
  if (!route.query.venue) return
  venue.value = route.query.venue
})

const isLogin = computed(() => user.value !== null)

watch(isLogin, (login: boolean) => {
  if (login && step.value === Step.AuthPage) step.value = Step.PaymentPage
  if (!login && step.value === Step.PaymentPage) step.value = Step.AuthPage
})

watch(() => route.query.venue, (venue) => {
  if (!venue) {
    step.value = Step.SelectionPage
    resetForm()
  }
})

const isSelectionPage = computed(() => step.value === Step.SelectionPage)
const isAuthPage = computed(() => step.value === Step.AuthPage)
const isPaymentPage = computed(() => step.value === Step.PaymentPage)
const isQRPage = computed(() => step.value === Step.QRPage)

function resetForm() {
  groupedTimeslots.value = {}
  invoiceData.value = {} as Invoice
  venue.value = ''
}

function updateHandler(newGroupedTimeslots: GroupedTimeslots) {
  groupedTimeslots.value = newGroupedTimeslots
}

function nextHandler() {
  if (step.value === Step.SelectionPage && isLogin.value)
    step.value = Step.PaymentPage
  else
    step.value = Step.AuthPage
  goTo('#booking')

}

function backHandler() {
  step.value = Step.SelectionPage
  goTo('#booking')
}

function submitHandler(invoiceDetails: Invoice) {
  step.value = Step.QRPage
  goTo('#booking')
  invoiceData.value = invoiceDetails
}

const sport = route.params.sportSlug as string
const sportStore = useSportsStore()
const activeSportName = computed(() => {
  return sportStore.getSportBySlug(sport)?.name || ''
})
</script>

<template>
  <PageBannerBooking :sport="activeSportName" />
  <BookingFormPage1 v-if="isSelectionPage" @next="nextHandler" @update="updateHandler" />
  <BookingFormPage2 v-if="isAuthPage" />
  <BookingFormPage3 v-if="isPaymentPage" @back="backHandler" :groupedTimeslots="groupedTimeslots"
    @submit="submitHandler" />
  <BookingFormQRPayNow v-if="isQRPage" :groupedTimeslots="groupedTimeslots" :invoiceData="invoiceData" />
</template>