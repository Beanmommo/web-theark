<script setup lang="ts">
import type { Pitch } from '../types/data'

defineProps({
  locationPitches: Array<Pitch>,
})
</script>

<template>
  <v-row no-gutters>
    <v-col cols="4" md="2">
      <div class="time-slot-header">Time</div>
    </v-col>
    <v-col cols="3" md="2">
      <div class="time-slot-header">Price (w/GST)</div>
    </v-col>
    <v-col cols="5" md="8">
      <div class="d-flex flex-row">
        <template v-for="pitch in locationPitches">
          <div class="time-slot-header flex-grow-1">
            Pitch {{ pitch.name }}
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
  background: #0a8900;
  color: #fff;
  font-weight: 600;
}
</style>