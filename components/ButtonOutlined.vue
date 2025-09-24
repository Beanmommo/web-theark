<script setup lang="ts">
import { useTheme } from 'vuetify';

const theme = useTheme()
const accentColor = computed(() => {
  return theme.current.value.colors.accent
})
</script>

<template>
  <div class="button" :style="{ borderColor: accentColor, color: accentColor }">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: $functional-white;
  border: 1px solid;
  padding: $unit $margin;
  border-radius: $margin * 2;
  font-weight: 600;
  height: 30px;
  cursor: pointer;

  &:hover {
    background: rgba(10, 138, 68, 0.2);
    transition: background 0.4s;
  }

  &:active {
    background: rgba(10, 138, 68, 0.9);
    transition: background 0.2s;
  }
}
</style>