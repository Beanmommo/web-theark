import { db } from '../../../utils/firebase'
import type { BookedSlotData } from '~/types/data'

export default defineEventHandler(async event =>
{
  const email = getRouterParam(event, 'email')
  if (!email) return {}
  const ref = db.ref('bookedSlots');
  const bookedSlotsData = new Promise<BookedSlotData>((resolve, _) =>
    ref.orderByChild("email").equalTo(email).once('value', (snapshot) =>
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

