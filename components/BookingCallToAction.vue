<script setup lang="ts">

defineProps({
  totalPayable: Number,
  creditsLeft: Number
})

const emit = defineEmits(['click'])

function clickHandler()
{
  emit('click')
}
</script>

<template>
  <div class="bookingCallToAction">
    <v-row class="px-8" justify="center" align="center">
      <v-col class="text-left white--text" cols="6">
        <div>TOTAL CHARGES</div>
        <h4 v-if="totalPayable">${{ (totalPayable * 1.09).toFixed(2) }}</h4>
      </v-col>
      <v-col class="text-right white--text" cols="6">
        <!-- <template v-if="creditsLeft && creditsLeft < 100">
          <div style="font-size: 12px">Credits Left: ${{ creditsLeft }}</div>
          <v-btn rounded color="white" class="accent--text the-ark-nav-btn" @click.prevent="$router.push('/credits')">Top
            Up</v-btn>
        </template> -->
        <v-btn rounded color="white" class="accent--text the-ark-nav-btn" @click="clickHandler">Book Now</v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>
.bookingCallToAction {
  position: fixed;
  bottom: 0;
  left: 0;
  color: white;
  background: black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-top: 5px dotted white;
  width: 100%;
  padding: $margin;
}


h4 {
  font-weight: 900;
}

.container {
  display: flex;
  align-items: center;
  justify-items: space-between;
}
</style>