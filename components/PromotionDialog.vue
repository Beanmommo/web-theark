<script setup lang="ts">
import { useWindowResize } from '../composables/windowResize'
const route = useRoute()
const configStore = useConfigStore()
const { config, showPopup } = storeToRefs(configStore)
const { width } = useWindowResize()

const sportSlug = computed(() =>
{
  const slug = route.params?.sportSlug
  return typeof slug === 'string' ? slug.toLowerCase() : undefined
})

const popupConfigs = computed(() => config.value?.popup ?? [])

const activePopup = computed(() =>
{
  const slug = sportSlug.value
  return popupConfigs.value.find((popup) =>
  {
    const popupSport = popup.typeOfSports.toLowerCase()
    if (popupSport === 'all') return true
    if (!slug) return false
    return popupSport === slug
  }) ?? null
})

const dialogVisible = computed({
  get()
  {
    return Boolean(showPopup.value && activePopup.value?.popup)
  },
  set(value: boolean)
  {
    if (!value) configStore.closePopup()
  }
})

function clickHandler()
{
  configStore.closePopup()
}
</script>

<template>
  <v-dialog v-model="dialogVisible" :max-width="width > 800 ? '70%' : '90%'">
    <v-card>
      <v-toolbar flat color="white">
        <v-btn icon @click="clickHandler">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-img :src="activePopup?.imgSrc" v-if="activePopup?.imgSrc" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
