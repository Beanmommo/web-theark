<script setup lang="ts">
import { type PackageDetails } from '../types/data';

const emit = defineEmits(['update'])

function selectHandler(packageSelected: PackageDetails) {
  emit('update', packageSelected)
}

const route = useRoute()
const sportSlug = route.params.sportSlug as string

const packagesStore = usePackagesStore()
const packageConfig = computed(() => {
  return packagesStore.getPackagesBySport(sportSlug)
})

</script>

<template>
  <SectionContainer v-if="packageConfig.length === 0">
    <div class="comingSoon">
      Coming Soon
    </div>
  </SectionContainer>
  <SectionContainer v-else>
    <div class="title__container">
      <h5>Buy credits to book at a discounted rate</h5>
    </div>
    <div class="packagesSelection">
      <PackagesSelectionCard v-for="packageItem in packageConfig" :packageItem="packageItem" @select="selectHandler" />
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

.comingSoon {
  margin-top: $margin;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
}
</style>