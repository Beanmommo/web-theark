import { defineStore } from 'pinia'
import { type Blockout } from '../types/data'

export const useBlockoutsStore = defineStore('blockouts', () =>
{
  const blockouts = ref([] as Blockout[])

  const fetchBlockouts = async () =>
  {
    const { data } = await useFetch('/api/blockouts')
    if (!data.value) return;
    const blockoutList: Blockout[] = Object.keys(data.value).map(key =>
    {
      return {
        key,
        ...data.value[key]
      }
    })
    blockouts.value = blockoutList
    return blockoutList
  }

  return {
    blockouts, fetchBlockouts
  }
})