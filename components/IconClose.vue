<script setup lang="ts">
import { useTheme } from 'vuetify';

const theme = useTheme()
const accentColor = computed(() => {
  return theme.current.value.colors.accent
})
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" :stroke="accentColor"
    class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
</template>