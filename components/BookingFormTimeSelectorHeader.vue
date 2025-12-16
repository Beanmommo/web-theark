<script setup lang="ts">
import { useTheme } from "vuetify";
import type { Pitch } from "../types/data";

defineProps({
  locationPitches: Array<Pitch>,
});

const theme = useTheme();
const accentColor = computed(() => {
  return theme.current.value.colors.accent;
});

const configStore = useConfigStore();

function getPitchName(pitch: Pitch) {
  const terminology = configStore.getSportTerminology(
    pitch.typeOfSports,
    "singular"
  );
  return `${terminology} ${pitch.name}`;
}
</script>

<template>
  <v-row no-gutters>
    <v-col cols="4" md="2">
      <div class="time-slot-header" :style="{ background: accentColor }">
        Time
      </div>
    </v-col>
    <v-col cols="3" md="2">
      <div class="time-slot-header" :style="{ background: accentColor }">
        Price (w/GST)
      </div>
    </v-col>
    <v-col cols="5" md="8">
      <div class="d-flex flex-row">
        <template v-for="pitch in locationPitches">
          <div
            class="time-slot-header flex-grow-1"
            :style="{ background: accentColor }"
          >
            {{ getPitchName(pitch) }}
          </div>
        </template>
      </div>
    </v-col>
  </v-row>
</template>

<style lang="scss" scoped>
.time-slot-header {
  text-align: center;
  padding: 10px 3px;
  font-size: 13px;
  color: #fff;
  font-weight: 600;
}
</style>
