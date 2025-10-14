<script setup lang="ts">
import { useCreditsStore } from '~/stores/credits'
definePageMeta({
  middleware: 'auth'
})
const user = useAuthUser()
const creditsStore = useCreditsStore();

await useAsyncData('credits', async () => {
  await creditsStore.fetchUserCredits()
  await creditsStore.fetchUserCreditRefunds()
})

onMounted(async () => {
  console.log('fetch credit')
  await creditsStore.fetchUserCredits()
  await creditsStore.fetchUserCreditRefunds()
})

</script>

<template>
  <PageBannerProfile>Hi {{ user?.displayName }}!</PageBannerProfile>
  <SectionContainer>
    <ProfileUserDetails />
    <ProfileBookings />
  </SectionContainer>

</template>