import { db } from '../../utils/firebase'
import type { BookingData } from '~/types/data'

export default defineEventHandler(async event =>
{
  const email = getRouterParam(event, 'email')
  if (!email) return {}
  const ref = db.ref('bookings');
  const bookings = new Promise<BookingData>((resolve, _) =>
    ref.orderByChild("email").equalTo(email).once('value', (snapshot) =>
    {
      const bookings: BookingData = snapshot.val()
      resolve(bookings)
    }, (errorObject) =>
    {
      console.log('The read failed: ' + errorObject.name);
      resolve({})
    })
  )
  return bookings
})

