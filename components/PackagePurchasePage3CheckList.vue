<script setup lang="ts">
const terms = ref(false)
const emit = defineEmits(['update'])

function inputHandler()
{
  if (terms)
    emit('update', true)
  else
    emit('update', false)
}
</script>

<template>
  <div class="packagePurchasePage3CheckList">
    <v-checkbox v-model="terms" @input="inputHandler">
      <template v-slot:label>
        <div class="label">
          I accept the
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <NuxtLink to="/terms" target="_blank">
                terms and conditions
              </NuxtLink>
            </template>
            Opens in new window
          </v-tooltip>
        </div>
      </template>
    </v-checkbox>

  </div>
</template>

<style lang="scss" scoped>
.label {
  font-size: 1rem;
}
</style>