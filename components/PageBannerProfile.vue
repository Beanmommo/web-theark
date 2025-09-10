<template>
  <div class="pageBannerProfile">
    <h2>
      <slot />
    </h2>
  </div>
</template>

<style lang="scss" scoped>
.pageBannerProfile {
  background-image: url('https://res.cloudinary.com/thearksg/image/upload/v1594089855/website/title_profile.png');
  @include page-banner;
}

h2 {
  color: white
}
</style>