import { db } from '../../utils/firebase'
import type { BookedSlotData } from '~/types/data'

export default defineEventHandler(async event =>
{
  const location = getRouterParam(event, 'location')
  if (!location) return {}
  const decodedLocation = decodeURI(location)
  const ref = db.ref('/bookedSlots');
  const bookedSlotsData = new Promise<BookedSlotData>((resolve, _) =>
    ref.orderByChild("location").equalTo(decodedLocation).once('value', (snapshot) =>
    {
      const bookedSlots: BookedSlotData = snapshot.val()
      resolve(bookedSlots)
    }, (errorObject) =>
    {
      console.log('The read failed: ' + errorObject.name);
      resolve({})
    })
  )
  return bookedSlotsData
})

