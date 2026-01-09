<template>
  <section class="pageBannerPackages">
    <div class="banner-content">
      <div
        class="sport-icon-container"
        @click="navigateToSportHome"
        v-if="sportIcon"
      >
        <VIcon :icon="sportIcon" size="48" class="sport-icon" />
      </div>
      <h2>Packages</h2>
    </div>
  </section>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const sportsStore = useSportsStore();

const sportSlug = computed(() => route.params.sportSlug as string);
const currentSport = computed(() =>
  sportsStore.getSportBySlug(sportSlug.value)
);
const sportIcon = computed(() => currentSport.value?.icon);

function navigateToSportHome() {
  if (sportSlug.value) {
    router.push(`/${sportSlug.value}`);
  }
}
</script>

<style lang="scss" scoped>
.pageBannerPackages {
  background-image: url("https://res.cloudinary.com/thearksg/image/upload/v1594089855/website/title_package.png");
  @include page-banner;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $margin;

  @media (max-width: $mobile) {
    gap: $unit;
  }
}

.sport-icon-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  @media (max-width: $mobile) {
    width: 48px;
    height: 48px;
  }
}

.sport-icon {
  color: white;

  @media (max-width: $mobile) {
    font-size: 32px !important;
  }
}

h2 {
  color: white;
  margin: 0;
}
</style>
