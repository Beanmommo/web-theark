<script setup lang="ts">
const terms = ref(false)
const covid = ref(false)
const emit = defineEmits(['update'])

function inputHandler()
{
  if (terms.value && covid.value)
    emit('update', true)
  else
    emit('update', false)

}
</script>

<template>
  <div class="bookingFormPage3CheckList">
    <v-checkbox v-model="terms" @input="inputHandler">
      <template v-slot:label>
        <div class="label">
          I accept the
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <NuxtLink to="/content/terms" target="_blank">
                terms and conditions
              </NuxtLink>
            </template>
            Opens in new window
          </v-tooltip>
          , including :
        </div>
      </template>
    </v-checkbox>
    <v-checkbox>
      <template v-slot:label>
        <div class="label">
          Providing more than <b>72 hours'</b> notice (prior to the booking date) for rescheduling via 9185 2555.<br />
          Requests with
          less than <b>72 hours'</b> notice will not be accepted.
        </div>
      </template>
    </v-checkbox>
    <v-checkbox v-model="covid" @input="inputHandler">
      <template v-slot:label>
        <div class="label">
          Adhering to the inclement weather policy, where ARK will assess and confirm whether rescheduling is allowed 45
          minutes before the booked time.
        </div>
      </template>
    </v-checkbox>
  </div>
</template>

<style lang="scss" scoped>
.label {
  font-size: 1rem;

  b {
    font-weight: 700;
  }
}
</style>