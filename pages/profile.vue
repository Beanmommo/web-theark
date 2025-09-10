<script setup lang="ts">
import { useCreditsStore } from '~/stores/credits'
definePageMeta({
  middleware: 'auth'
})
const user = useAuthUser()
const creditsStore = useCreditsStore();

await useAsyncData('credits', () => creditsStore.fetchUserCredits())

onMounted(async () =>
{
  console.log('fetch credit')
  await creditsStore.fetchUserCredits()
})

</script>

<template>
  <PageBannerProfile>Hi {{ user?.displayName }}!</PageBannerProfile>
  <SectionContainer>
    <ProfileUserDetails />
    <ProfileBookings />
  </SectionContainer>

</template>