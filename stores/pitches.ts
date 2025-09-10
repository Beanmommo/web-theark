import { defineStore } from 'pinia'
import { type Pitch } from '../types/data'

export const usePitchesStore = defineStore('pitches', () =>
{
  const pitches = ref([] as Pitch[])

  const fetchPitches = async () =>
  {
    const { data } = await useFetch('/api/pitches')
    if (!data.value) return;
    const pitchList: Pitch[] = Object.keys(data.value).map(key =>
    {
      return {
        key,
        ...data.value[key]
      }
    })
    pitches.value = pitchList
    return pitches.value
  }

  return {
    pitches, fetchPitches
  }
})