import { db } from '../../utils/firebase'

export default defineEventHandler(async event =>
{
  const userKey = getRouterParam(event, 'userKey')

  if (!userKey) return {}
  const ref = db.ref('creditPackages');
  const creditPackages = new Promise((resolve, reject) =>
    ref.orderByChild("userKey").equalTo(userKey).once('value', (snapshot) =>
    {
      const data = snapshot.val()
      resolve(data)
    }, (errorObject) =>
    {
      console.log('The read failed: ' + errorObject.name);
      reject()
    })
  )
  return creditPackages
})

