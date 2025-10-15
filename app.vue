<script setup lang="ts">
import { useTheme } from 'vuetify'
import { computed } from 'vue'

const theme = useTheme()
const themeKey = computed(() => theme.global.name.value)

// Fetch config on app load for sport terminology
const configStore = useConfigStore()
await useAsyncData('config', () => configStore.fetchConfig())

const route = useRoute()
const sportsStore = useSportsStore()
const { sports } = storeToRefs(sportsStore)

function updateThemeByRoute() {
  let isChanged = false
  for (const sport of sports.value) {
    if (route.path.includes(sport.slug)) {
      console.log('Changed to ' + sport.theme)
      theme.change(sport.theme)
      sportsStore.setActiveSportBySlug(sport.slug)
      isChanged = true
      return
    }
    if (route.params.sportSlug === sport.slug) {
      console.log('Changed to ' + sport.theme)
      theme.change(sport.theme)
      sportsStore.setActiveSportBySlug(sport.slug)
      isChanged = true
      return
    }
  }
  if (!isChanged) {
    theme.change('thearkTheme')
    console.log('Changed to thearkTheme')
  }
}

watch(() => [route.params.sportSlug], updateThemeByRoute, { immediate: true })
</script>

<template>
  <div :key="themeKey">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
