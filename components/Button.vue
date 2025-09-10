<script setup lang="ts">
defineProps({
  disabled: Boolean
})
</script>

<template>
  <button class="button" :class="{ disabled: disabled }" :disabled="disabled">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: flex;
  justify-content: center;
  align-items: center;
  background: $primary-green;
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
    background: rgba(10, 138, 68, 0.7);
    transition: background 0.4s;
  }

  &:active {
    background: rgba(10, 138, 68, 0.9);
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