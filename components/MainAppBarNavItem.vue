<template>
  <div class="nav-item">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.nav-item {
  font-family: $primary-font-stack;
  font-weight: 500;
  letter-spacing: 0.2em;
  font-size: 0.9rem;
  padding: $unit $margin;
  border-radius: $unit;
  cursor: pointer;
  background-position: center;
  transition: background 0.2s;

  &:hover {
    background: #eaeaea radial-gradient(circle, transparent 1%, #5e5e5e 1%) center/15000%;
    border-radius: $unit;
  }

  &:active {
    background-color: #b3b3b3;
    transition: background 0s;
    border-radius: $unit;

  }
}
</style>