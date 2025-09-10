<template>
  <div class="paymentMethod">
    <div class="radio">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.paymentMethod {
  display: grid;
  grid-gap: $margin;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  border: $border;
  padding: $margin $unit;
  margin-bottom: $margin;
}
</style>