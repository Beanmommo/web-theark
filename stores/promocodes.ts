import { defineStore } from 'pinia'
import { type PromoCode } from '../types/data'

export const usePromoCodesStore = defineStore('promocodes', () =>
{
  const promocodes = ref([] as PromoCode[])

  const fetchPromoCodes = async () =>
  {

    const { data } = await useFetch('/api/promocodes')
    if (!data.value) return;
    const promocodeList: PromoCode[] = Object.keys(data.value).map(key =>
    {
      return {
        key,
        ...data.value[key]
      }
    })
    promocodes.value = promocodeList
    return promocodeList
  }

  return {
    promocodes, fetchPromoCodes
  }
})