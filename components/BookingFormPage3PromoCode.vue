<script setup lang="ts">
import { usePromoCodesStore } from '~/stores/promocodes'
import { storeToRefs } from 'pinia';

const emit = defineEmits(['update'])
const promocodesStore = usePromoCodesStore()
const { promocodes } = storeToRefs(promocodesStore)


const route = useRoute()
const dayjs = useDayjs()
const code = ref("")
const valid = ref(false)
const error = ref(false)

const venue = computed(() => route.query.venue)
const date = computed(() => dayjs(route.query.date as string, 'YYYY-MM-DD'))

function clickHandler()
{
  error.value = false
  valid.value = false
  const found = promocodes.value.find(promocode =>
  {
    return promocode.promocode &&
      promocode.promocode.toLowerCase() === code.value.toLowerCase() &&
      promocode.locations.includes(venue.value as string) &&
      dayjs().isSameOrAfter(promocode.publishStart) &&
      dayjs().isBefore(promocode.publishEnd) &&
      dayjs(date.value).isSameOrBefore(promocode.validTill) &&
      dayjs(date.value).isSameOrAfter(promocode.startDate)
  }
  )
  if (found !== undefined)
  {
    valid.value = true
    emit('update', found)
  }

  else
  {
    error.value = true
    emit('update', {})
  }
}
</script>

<template>
  <div class="bookingFormPage3PromoCode">
    <h5>Promo Code</h5>
    <v-row align="center">
      <v-col cols="9">
        <v-text-field variant="underlined" placeholder="Enter Promo Code" v-model="code">
          <template v-slot:append>
            <v-icon class="green" v-if="valid">mdi-check-circle</v-icon>
          </template>
        </v-text-field>
        <span class="red" v-if="error">You have entered an invalid promo code</span>
      </v-col>
      <v-col cols="3">
        <div style="text-align: right">
          <v-btn @click="clickHandler">Apply</v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>
.green {
  color: $primary-green;
}

.red {
  color: $primary-red;
}
</style>
