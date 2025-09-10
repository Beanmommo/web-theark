import { db } from '../../utils/firebase'

export default defineEventHandler(async event =>
{
  const booking = await readBody(event)

  const ref = db.ref('/bookings');
  const bookingRef = ref.push(booking)
  return bookingRef.key
})