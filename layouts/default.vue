<template>
  <LayoutBase>
    <template #header>
      <ClientOnly>
        <MainAppBar />
      </ClientOnly>
    </template>
    <template #main>
      <slot />
    </template>
    <template #footer>
      <MainFooter />
    </template>
  </LayoutBase>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify/lib/composables/theme.mjs';

const route = useRoute()
const theme = useTheme()
const sportsStore = useSportsStore()
const { sports } = storeToRefs(sportsStore)

function updateThemeByRoute() {
  let isChanged = false
  for (const sport of sports.value) {
    if (route.path.includes(sport.name)) {
      theme.change(sport.theme)
      isChanged = true
      return
    }
  }
  if (!isChanged) {
    theme.change('thearkTheme')
    console.log('Changed to thearkTheme')
  }
}

watch(() => route.path, updateThemeByRoute)
</script>