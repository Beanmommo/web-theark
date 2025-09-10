import { db } from '../utils/firebase'

export default defineEventHandler(async event =>
{
  const user = await readBody(event)

  const ref = db.ref('users/' + user.uid);
  ref.set(user)
  return user.uid
})