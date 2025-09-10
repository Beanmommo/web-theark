import { defineStore } from 'pinia'
import { type Venue } from '../types/data'

export const useLocationsStore = defineStore('locations', () =>
{
  const locations = ref([] as Venue[])

  const fetchLocations = async () =>
  {
    const { data } = await useFetch('/api/locations')
    const filteredActive: Venue[] = []
    if (data.value)
      Object.keys(data.value).forEach(key =>
      {
        data.value[key].active && filteredActive.push({ ...data.value[key], key })
      })
    locations.value = filteredActive
    return locations.value
  }

  function getLocation(name: string)
  {
    return locations.value.find(location => location.name === name)
  }

  return {
    locations,
    fetchLocations,
    getLocation
  }
})