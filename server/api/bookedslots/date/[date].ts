import { db } from '../../../utils/firebase'
import type { BookedSlotData } from '~/types/data'

export default defineEventHandler(async event => {
  const date = getRouterParam(event, 'date')
  if (!date) return {}
  
  // Create start and end date for the given date (full day)
  const startDate = `${date}`
  const endDate = `${date}T23:59:59+23:00`
  
  // Use Firebase query to fetch data within date range
  const ref = db.ref('/bookedSlots')
  const bookedSlotsData = new Promise<BookedSlotData>((resolve, _) =>
    ref.orderByChild("date")
      .startAt(startDate)
      .endAt(endDate)
      .once('value', (snapshot) => {
        const bookedSlots: BookedSlotData = snapshot.val() || {}
        resolve(bookedSlots)
      }, (errorObject) => {
        console.log('The read failed: ' + errorObject.name)
        resolve({})
      })
  )
  
  return bookedSlotsData
})
