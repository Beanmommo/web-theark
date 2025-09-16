<script setup lang="ts">
const props = defineProps({
  color: {
    type: String,
    default: 'green'
  }
})

const iconColor = computed(() => props.color)
</script>

<template>
  <div class="venueAddress">
    <IconMapMarker />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.venueAddress {
  display: flex;
  align-items: center;
  gap: $margin;

  >svg {
    width: 30px;
    color: v-bind(iconColor);
  }
}
</style>