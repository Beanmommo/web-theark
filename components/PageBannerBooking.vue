<template>
  <section class="pageBannerPitches">
    <h2>{{ sport }} Booking</h2>
  </section>
</template>

<script setup lang="ts">
defineProps({
  sport: {
    type: String,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.pageBannerPitches {
  background-image: url('https://res.cloudinary.com/thearksg/image/upload/v1594089855/website/title_booking.png');
  @include page-banner;
}

h2 {
  color: white;
}
</style>