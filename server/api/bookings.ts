import { db } from '../utils/firebase'

export default defineEventHandler(async event =>
{
  const ref = db.ref('/bookings');
  const bookingData = new Promise((resolve, reject) =>
    ref.on('value', (snapshot) =>
    {
      const data = snapshot.val()
      resolve(data)
    }, (errorObject) =>
    {
      console.log('The read failed: ' + errorObject.name);
      reject()
    })
  )

  return bookingData

})