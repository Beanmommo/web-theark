<template>
  <section class="sectionContainer">
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.sectionContainer {
  display: grid;
  margin: $margin auto;
  max-width: $main-max;
  padding: $margin;
  grid-gap: $p-margin;
}
</style>