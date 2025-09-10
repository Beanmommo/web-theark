import { db } from '../../utils/firebase'
import type { User } from '~/types/data'

export default defineEventHandler(async event =>
{
  const uid = getRouterParam(event, 'uid')
  if (!uid) return null
  
  const ref = db.ref('users/' + uid);
  const userData = new Promise<User | null>((resolve, _) =>
    ref.once('value', (snapshot) =>
    {
      const user: User | null = snapshot.val()
      resolve(user)
    }, (errorObject) =>
    {
      console.log('The read failed: ' + errorObject.name);
      resolve(null)
    })
  )
  return userData
})
