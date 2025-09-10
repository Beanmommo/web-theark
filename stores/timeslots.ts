import { defineStore } from 'pinia'
import { type Timeslot } from '../types/data'

export const useTimeslotsStore = defineStore('timeslots', () =>
{
  const timeslots = ref([] as Timeslot[])

  const fetchTimeslots = async () =>
  {
    const { data } = await useFetch('/api/timeslots')
    if (!data.value) return;
    const timeslotList: Timeslot[] = Object.keys(data.value).map(key =>
    {
      return {
        key,
        ...data.value[key]
      }
    })
    timeslots.value = timeslotList
    return timeslots.value
  }

  return {
    timeslots, fetchTimeslots
  }
})