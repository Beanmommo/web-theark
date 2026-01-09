<script setup lang="ts">
import type { Sport } from "~/types/sport";

const props = defineProps<{
  sport: Sport;
  publishDate: string;
}>();
</script>

<template>
  <section class="sectionComingSoonSimple">
    <div class="sectionContainer">
      <div class="coming-soon-content">
        <VIcon icon="mdi-calendar-clock" size="80" class="coming-soon-icon" />
        <h2>{{ sport.name }} Coming Soon!</h2>
        <p class="publish-date">Available from {{ publishDate }}</p>
        <p class="description">
          We're excited to bring {{ sport.name }} to The Ark. Stay tuned!
        </p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.sectionComingSoonSimple {
  min-height: 400px;
  display: flex;
  justify-items: center;
  align-items: center;
  padding: $p-margin * 3 0;
  background: #f5f5f5;

  @media (max-width: $mobile) {
    min-height: 300px;
    padding: $p-margin * 2 0;
  }
}

.sectionContainer {
  max-width: $main-max;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 $margin;
}

.coming-soon-content {
  text-align: center;
  max-width: 600px;
  padding: $p-margin * 2;
  background: $functional-white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: $mobile) {
    padding: $p-margin;
  }

  .coming-soon-icon {
    color: #999;
    margin-bottom: $margin * 2;
    opacity: 0.8;

    @media (max-width: $mobile) {
      font-size: 48px !important;
      margin-bottom: $margin;
    }
  }

  h2 {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: $margin;
    color: #333;

    @media (max-width: $mobile) {
      font-size: 1.5rem;
    }
  }

  .publish-date {
    font-size: 1.3rem;
    font-weight: 500;
    color: #666;
    margin-bottom: $margin * 2;

    @media (max-width: $mobile) {
      font-size: 1rem;
      margin-bottom: $margin;
    }
  }

  .description {
    font-size: 1.1rem;
    color: #888;
    line-height: 1.6;

    @media (max-width: $mobile) {
      font-size: 0.9rem;
    }
  }
}
</style>

