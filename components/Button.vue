<script setup lang="ts">
import { useTheme } from 'vuetify'
const theme = useTheme()
const accent = theme.current.value.colors.accent

const props = defineProps({
  disabled: Boolean,
  color: String
})

const defaultColor = computed(() => props.color || accent)
const hoverColor = computed(() => `${defaultColor.value}9a`)
const activeColor = computed(() => `${defaultColor.value}cc`)

const currentBg = ref(defaultColor.value)

function setHover() {
  currentBg.value = hoverColor.value
}
function setActive() {
  currentBg.value = activeColor.value
}
function setDefault() {
  currentBg.value = defaultColor.value
}
</script>

<template>
  <button class="button" :class="{ disabled: disabled }" :disabled="disabled" :style="{ background: currentBg }"
    @mouseover="setHover" @mousedown="setActive" @mouseleave="setDefault" @mouseup="setHover">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: $functional-white;
  padding: $unit $margin;
  border-radius: $margin * 2;
  cursor: pointer;
  font-family: 'Montserrat';
  font-weight: 500;
  font-size: 0.9rem;
  letter-spacing: 0.089em;
  text-indent: 0.089em;

  &:hover {
    transition: background 0.4s;
  }

  &:active {
    transition: background 0.2s;
  }
}

.disabled {
  background: $primary-grey;
  cursor: not-allowed;

  &:hover {
    background: $primary-grey;
  }
}
</style>