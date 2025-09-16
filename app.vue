<script setup lang="ts">
import { useTheme } from 'vuetify'
import { computed } from 'vue'

const theme = useTheme()
const themeKey = computed(() => theme.global.name.value)
</script>

<template>
  <div :key="themeKey">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
