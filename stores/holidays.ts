import { defineStore } from 'pinia'
import { type Holiday } from '../types/data'


export const useHolidaysStore = defineStore('holidays', () =>
{
  const dayjs = useDayjs()
  const year = dayjs().year();
  const nextYear = dayjs().add(1, "year").year();

  const holidays = ref([] as Holiday[])

  const fetchHolidays = async () =>
  {
    const { data } = await useFetch(`/api/holidays`);
    let holidayList: Holiday[] = []
    const val = data.value
    if (!val) return []
    if (val[year])
      holidayList = [...val[year]];
    if (val[nextYear])
      holidayList = [...holidayList, ...val[nextYear]]
    holidays.value = holidayList
    return holidayList
  }

  return {
    holidays, fetchHolidays
  }
})