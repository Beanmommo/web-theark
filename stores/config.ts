import { defineStore } from 'pinia'
import { type Config } from '../types/data'

export const useConfigStore = defineStore('config', () =>
{
  const config = ref<Config>()
  const showPopup = ref(false)

  const fetchConfig = async () =>
  {

    const { data } = await useFetch('/api/config')
    if (!data.value) return;
    config.value = data.value as Config
    showPopup.value = config.value.popup ? config.value.popup : false
    return config.value
  }

  const closePopup = () =>
  {
    showPopup.value = false
  }

  return {
    config, showPopup, fetchConfig, closePopup
  }
})