import { db } from '../utils/firebase'

export default defineEventHandler(async (event) =>
{
  const body = await readBody(event)

  const ref = db.ref('/contactUs')
  const newPostRef = ref.push(body, (error) =>
  {
    if (error)
    {
      console.log('Data cannot be saved.' + error)
      return error
    }
  });;
  return { success: true, key: newPostRef }
})