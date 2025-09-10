<template>
  <section class="pageBannerContent">
    <h2>
      <slot />
    </h2>
  </section>
</template>

<style lang="scss" scoped>
.pageBannerContent {
  background-image: url('https://res.cloudinary.com/thearksg/image/upload/f_auto/v1594089843/website/title_terms.png');
  @include page-banner;
}

h2 {
  color: white;
}
</style>