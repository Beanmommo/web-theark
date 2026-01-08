<script setup lang="ts">
import { useTheme } from "vuetify";
import { computed } from "vue";

const theme = useTheme();
const themeKey = computed(() => theme.global.name.value);

// Fetch config and sports on app load
const configStore = useConfigStore();
const sportsStore = useSportsStore();

await Promise.all([
  useAsyncData("config", () => configStore.fetchConfig()),
  useAsyncData("sports", () => sportsStore.fetchSports()),
]);

const route = useRoute();
const { sports } = storeToRefs(sportsStore);

function updateThemeByRoute() {
  let isChanged = false;
  for (const sport of sports.value) {
    if (route.path.includes(sport.slug)) {
      theme.change(sport.theme);
      sportsStore.setActiveSportBySlug(sport.slug);
      isChanged = true;
      return;
    }
    if (route.params.sportSlug === sport.slug) {
      theme.change(sport.theme);
      sportsStore.setActiveSportBySlug(sport.slug);
      isChanged = true;
      return;
    }
  }
  if (!isChanged) {
    theme.change("thearkTheme");
  }
}

watch(() => [route.params.sportSlug], updateThemeByRoute, { immediate: true });
</script>

<template>
  <div :key="themeKey">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
