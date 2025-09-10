<script setup lang="ts">
import { type PackageDetail } from '../types/data';



const selectedPackage = ref<PackageDetail>()

</script>

<template>
  <SectionContainer>
    <div class="title__container">
      <h5>Buy credits to book at a discounted rate</h5>
    </div>
    <PackagesSelection v-model="selectedPackage" />
    <div class="note">
      <sup>*</sup>All packages must be used within 6 months from purchase
    </div>
  </SectionContainer>
</template>

<style lang="scss" scoped>
.title__container {
  display: flex;
  align-items: center;
  justify-content: center;

  h5 {
    text-transform: none;
  }
}

.note {
  text-align: center
}
</style>