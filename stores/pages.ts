import { defineStore } from 'pinia'
import { type Page } from '../types/data'

export const usePagesStore = defineStore('pages', () =>
{
  const page = ref<Page>()

  const getPageByUrl = async (url: string) =>
  {
    const { data } = await useFetch(`/api/pages/${url}`)
    if (!data.value) return;
    page.value = data.value as Page
    return page.value
  }

  return {
    page, getPageByUrl
  }
})