<script setup lang="ts">
import { useTheme } from 'vuetify';

const theme = useTheme()
const accentColor = computed(() => {
  return theme.current.value.colors.accent
})
</script>

<template>
  <div class="icon-button" :style="{ color: accentColor }">
    <div class="icon">
      <slot name="icon" />
    </div>
    <h6>
      <slot name="title" />
    </h6>
  </div>
</template>

<style lang="scss" scoped>
.icon-button {
  display: flex;
  align-items: center;
  // color: $primary-green;
  cursor: pointer;

  .icon {
    width: 1.6rem;
    height: 1.6rem
  }

  h6 {
    font-size: 0.9rem;
    font-weight: 600;
    // color: $primary-green;
    margin: 0;
  }
}
</style>