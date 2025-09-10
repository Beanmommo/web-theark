<script setup lang="ts">
import { type PackageDetails } from '../types/data';
import { packagesConfig } from '../configs/packages'

const emit = defineEmits(['update'])

function selectHandler(packageSelected: PackageDetails)
{
  emit('update', packageSelected)
}
</script>

<template>
  <SectionContainer>
    <div class="title__container">
      <h5>Buy credits to book at a discounted rate</h5>
    </div>
    <div class="packagesSelection">
      <template v-for="packageItem in packagesConfig">
        <PackagesSelectionCard :packageItem="packageItem" @select="selectHandler" />
      </template>
    </div>
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

.packagesSelection {
  display: grid;
  gap: $unit;
  grid-template-columns: 1fr;

  @include md {
    grid-template-columns: 1fr 1fr;
  }
}
</style>