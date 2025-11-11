<script setup lang="ts">
import type { Pitch } from "~/types/data";

// Props
const props = defineProps({
  locationKey: {
    type: String,
    required: true,
  },
  sportSlug: {
    type: String,
    required: true,
  },
});

// Store
const pitchesStore = usePitchesStore();
const { pitches } = storeToRefs(pitchesStore);

// Types
type VenueItem = {
  item: {
    icon: string;
    label: string;
  }[];
  borderColor: string;
  itemBackgroundColor: string;
};

type VenuePitchItem = { icon: string; label: string };
type VenuePitchBuilderContext = {
  groupedBySize: Record<string, Pitch[]>;
  pitches: Pitch[];
};
type VenuePitchConfig = {
  borderColor: string;
  itemBackgroundColor: string;
  buildItems: (ctx: VenuePitchBuilderContext) => VenuePitchItem[];
};

// Derived data
const normalizedSportSlug = computed(
  () => props.sportSlug?.toLowerCase() || "futsal"
);

const pitchesForVenue = computed(() =>
  (pitches.value || []).filter(
    (p: Pitch) => p.locationKey === props.locationKey
  )
);

const selectedSportPitches = computed(() =>
  pitchesForVenue.value.filter(
    (p: Pitch) =>
      (p.typeOfSports || "futsal").toLowerCase() === normalizedSportSlug.value
  )
);

const groupPitchesBySize = (pitchList: Pitch[]) =>
  pitchList.reduce((acc, p) => {
    const sizeKey = p.size ? String(p.size) : "unknown";
    if (!acc[sizeKey]) acc[sizeKey] = [];
    acc[sizeKey].push(p);
    return acc;
  }, {} as Record<string, Pitch[]>);

// Builders per sport
const buildFutsalItems = ({
  groupedBySize,
}: VenuePitchBuilderContext): VenuePitchItem[] => {
  const entries: VenuePitchItem[] = [
    { icon: "/Icon/pitch_green_icon2.svg", label: "Astro Turf" },
  ];

  const sizeDetails = Object.entries(groupedBySize)
    .map(([sizeKey, pitchList]) => ({ sizeKey, pitchList: pitchList ?? [] }))
    .filter(({ pitchList }) => pitchList.length > 0)
    .sort((a, b) => {
      const aNum = Number(a.sizeKey);
      const bNum = Number(b.sizeKey);
      const A = Number.isFinite(aNum) ? aNum : Number.MAX_SAFE_INTEGER;
      const B = Number.isFinite(bNum) ? bNum : Number.MAX_SAFE_INTEGER;
      return A - B;
    });

  sizeDetails.forEach(({ sizeKey, pitchList }) => {
    const numericSize = Number(sizeKey);
    if (Number.isFinite(numericSize)) {
      entries.push({
        icon: "/Icon/pitch_green_icon3.svg",
        label: `${numericSize} Aside`,
      });
    }
    const count = pitchList.length;
    entries.push({
      icon: "/Icon/pitch_green_icon1.svg",
      label: `${count} Field${count > 1 ? "s" : ""}`,
    });
  });

  return entries;
};

const buildPickleballItems = ({
  groupedBySize,
  pitches,
}: VenuePitchBuilderContext): VenuePitchItem[] => {
  const entries: VenuePitchItem[] = [];

  const sizeDetails = Object.entries(groupedBySize)
    .map(([sizeKey, pitchList]) => ({ sizeKey, pitchList: pitchList ?? [] }))
    .filter(({ pitchList }) => pitchList.length > 0)
    .sort((a, b) => {
      const aNum = Number(a.sizeKey);
      const bNum = Number(b.sizeKey);
      const A = Number.isFinite(aNum) ? aNum : Number.MAX_SAFE_INTEGER;
      const B = Number.isFinite(bNum) ? bNum : Number.MAX_SAFE_INTEGER;
      return A - B;
    });

  sizeDetails.forEach(({ sizeKey, pitchList }) => {
    const count = pitchList.length;
    entries.push({
      icon: "/Icon/court_blue_icon2.svg",
      label: `${count} Court${count > 1 ? "s" : ""}`,
    });
    const numericSize = Number(sizeKey);
    if (Number.isFinite(numericSize)) {
      entries.push({
        icon: "/Icon/court_blue_icon3.svg",
        label: `${numericSize} Aside`,
      });
    }
  });

  // If no size groups, still show total courts
  if (!entries.length && pitches.length) {
    entries.push({
      icon: "/Icon/court_blue_icon1.svg",
      label: `${pitches.length} Court${pitches.length > 1 ? "s" : ""}`,
    });
  }

  return entries;
};

// Configs
const sportConfigs: Record<string, VenuePitchConfig> = {
  futsal: {
    borderColor: "#0A8900",
    itemBackgroundColor: "#F7FFF4",
    buildItems: buildFutsalItems,
  },
  pickleball: {
    borderColor: "#2282d6",
    itemBackgroundColor: "#E5F3FF",
    buildItems: buildPickleballItems,
  },
};

// Final computed display
const sportVenueItem = computed<VenueItem | null>(() => {
  const cfg = sportConfigs[normalizedSportSlug.value];
  if (!cfg) return null;

  const sportPitches = selectedSportPitches.value;
  if (!sportPitches.length) return null;

  const groupedBySize = groupPitchesBySize(sportPitches);
  const items = cfg.buildItems({ groupedBySize, pitches: sportPitches });
  if (!items.length) return null;

  return {
    borderColor: cfg.borderColor,
    itemBackgroundColor: cfg.itemBackgroundColor,
    item: items,
  };
});
</script>

<template>
  <div v-if="sportVenueItem" class="venueItem">
    <div
      class="icon__item"
      v-for="item in sportVenueItem.item"
      :style="{
        border: sportVenueItem.borderColor,
        background: sportVenueItem.itemBackgroundColor,
      }"
    >
      <img :src="item.icon" :alt="item.label + ' Icon'" />
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.venueItem {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-auto-flow: column;
  justify-content: start;
  grid-gap: $margin;
}

.icon__item {
  display: flex;
  gap: $unit;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  padding: $unit 0;

  > img {
    width: 50px;
  }

  > span {
    font-weight: 500;
  }
}
</style>
