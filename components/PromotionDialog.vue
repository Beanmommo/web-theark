<script setup lang="ts">
import { useWindowResize } from '../composables/windowResize'
const configStore = useConfigStore()
const { config, showPopup } = storeToRefs(configStore)
const { width } = useWindowResize()

function clickHandler()
{
  configStore.closePopup()
}
</script>

<template>
  <v-dialog v-model="showPopup" :max-width="width > 800 ? '70%' : '90%'">
    <v-card>
      <v-toolbar flat color="white">
        <v-btn icon @click="clickHandler">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-img :src="config.imgSrc" v-if="config" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>