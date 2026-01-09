<script setup lang="ts">
import type { Sport } from "~/types/sport";

const props = defineProps<{
  sport: Sport;
  publishDate: string;
}>();
</script>

<template>
  <section
    class="sectionComingSoon"
    :style="{ backgroundImage: `url(${sport.backgroundImage})` }"
  >
    <div class="sectionContainer">
      <div class="coming-soon-overlay">
        <div class="coming-soon-content">
          <VIcon icon="mdi-calendar-clock" size="80" class="coming-soon-icon" />
          <h2>{{ sport.name }} Coming Soon!</h2>
          <p class="publish-date">Available from {{ publishDate }}</p>
          <p class="description">
            We're excited to bring {{ sport.name }} to The Ark. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.sectionComingSoon {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  min-height: 500px;
  display: flex;
  justify-items: center;
  align-items: center;
  padding: $p-margin 0;

  @media (max-width: $mobile) {
    min-height: auto;
    padding: $p-margin 0;
  }
}

.sectionContainer {
  max-width: $main-max;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.coming-soon-overlay {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: $p-margin;
  max-width: $main-max;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - #{$margin * 2});

  @media (max-width: $mobile) {
    padding: $margin * 2;
  }

  @include tablet {
    margin: 0 auto;
    padding: $p-margin * 3;
    width: 100%;
  }
}

.coming-soon-content {
  text-align: center;
  max-width: 600px;
  padding: $margin;

  .coming-soon-icon {
    color: $functional-white;
    margin-bottom: $margin;
    opacity: 0.9;

    @media (max-width: $mobile) {
      font-size: 48px !important;
    }
  }

  h2 {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: $margin;
    color: $functional-white;

    @media (max-width: $mobile) {
      font-size: 1.5rem;
    }
  }

  .publish-date {
    font-size: 1.3rem;
    font-weight: 500;
    color: $functional-white;
    margin-bottom: $margin;
    opacity: 0.95;

    @media (max-width: $mobile) {
      font-size: 1rem;
    }
  }

  .description {
    font-size: 1.1rem;
    color: $functional-white;
    line-height: 1.6;
    opacity: 0.9;

    @media (max-width: $mobile) {
      font-size: 0.9rem;
    }
  }
}
</style>

