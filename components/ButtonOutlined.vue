<template>
  <div class="button">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: $functional-white;
  color: $primary-green;
  border: 1px solid $primary-green;
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