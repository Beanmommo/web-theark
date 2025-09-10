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
    color: green;
  }
}
</style>