<script setup lang="ts">
import { useTheme } from 'vuetify'
import { computed } from 'vue'

const theme = useTheme()
const themeKey = computed(() => theme.global.name.value)


const route = useRoute()
const sportsStore = useSportsStore()
const { sports } = storeToRefs(sportsStore)

function updateThemeByRoute() {
  let isChanged = false
  for (const sport of sports.value) {
    if (route.path.includes(sport.name)) {
      theme.change(sport.theme)
      sportsStore.setActiveSport(sport.name)
      isChanged = true
      return
    }
  }
  if (!isChanged) {
    theme.change('thearkTheme')
    console.log('Changed to thearkTheme')
  }
}

watch(() => route.path, updateThemeByRoute, { immediate: true })
</script>

<template>
  <div :key="themeKey">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
