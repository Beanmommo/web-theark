import { db } from '../utils/firebase'

export default defineEventHandler(async event =>
{
  const ref = db.ref('/blockouts');
  const snapshot = await ref.once('value');
  if (snapshot.exists())
  {
    const value = snapshot.val()
    return value
  } else
  {
    console.log("No data available");
    return {}
  }
})