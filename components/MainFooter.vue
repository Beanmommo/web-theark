<script setup lang="ts">

</script>

<template>
  <section class="sectionFooter">
    <div class="footer--left">
      <img src="/Icon/pattern_footer1.svg" style="width: 100%; height: auto;" alt="footer pattern 1" />
    </div>
    <MainFooterSocialIcons />
    <div class="footer--right">
      <img src="/Icon/pattern_footer2.svg" style="width: 100%; height: auto;" alt="footer pattern 2" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.sectionFooter {
  display: grid;
  align-items: center;
  justify-items: center;
  grid-auto-flow: column;
  background: $primary-green;
  min-height: 300px;

  @include md {
    grid-template-columns: 25% 1fr 20%;
  }
}

.footer {

  &--left,
  &--right {
    display: none;
  }

  @include md {

    &--left,
    &--right {
      display: flex;
    }

  }

}
</style>