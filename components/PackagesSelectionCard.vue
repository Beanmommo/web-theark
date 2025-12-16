<script setup lang="ts">
import { useTheme } from "vuetify";
import { type PackageDetails } from "../types/data";

const props = defineProps({
  packageItem: {
    type: Object as PropType<PackageDetails>,
    required: true,
  },
});

const emit = defineEmits(["select"]);

// Use Cloudinary image if available, otherwise fallback to local image
const useCloudinaryImage = computed(() => !!props.packageItem.image);

const cloudinaryImageSrc = computed(() => {
  return props.packageItem.image || "";
});

const localImageUrl = computed(() => {
  return `/Images/${props.packageItem.id}.png`;
});

const extraCredit = computed(() => {
  return parseInt(props.packageItem.value) - parseInt(props.packageItem.amount);
});

function clickHandler() {
  emit("select", props.packageItem);
}

const theme = useTheme();
const accentColor = computed(() => {
  return theme.current.value.colors.accent;
});
</script>

<template>
  <div class="packagesSelectionCard">
    <h4>{{ packageItem.title || packageItem.name || "Package" }}</h4>
    <CldImage
      v-if="useCloudinaryImage"
      :src="cloudinaryImageSrc"
      width="200"
      height="200"
      :alt="packageItem.title || packageItem.name || 'Package image'"
      class="icon"
      crop="pad"
    />
    <img
      v-else
      :src="localImageUrl"
      class="icon"
      :alt="packageItem.title || packageItem.name || 'Package image'"
    />
    <div class="details">
      <div class="amount" :style="{ color: accentColor }">
        ${{ packageItem.amount }}
      </div>
      <div class="extra" :style="{ color: accentColor }">
        +${{ extraCredit }} Credits
      </div>
    </div>
    <Button @click="clickHandler">Buy Package</Button>
  </div>
</template>

<style lang="scss" scoped>
.packagesSelectionCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $unit;
  justify-content: center;
  box-shadow: $box-shadow;
  padding: $margin;

  .icon {
    width: 10rem;
    height: 10rem;
    object-fit: contain;
  }

  .details {
    text-align: center;
  }

  .amount {
    font-size: 1.4rem;
    font-weight: 600;
  }

  .extra {
    font-size: 0.8rem;
    font-weight: 500;
  }
}
</style>
