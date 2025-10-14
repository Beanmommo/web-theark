import { fs } from '../../../utils/firebase'

export default defineEventHandler(async event =>
{
  const id = getRouterParam(event, 'id')
  if (!id) return { error: 'ID is required' }
  
  const data = await readBody(event)
  
  const ref = fs.collection('creditRefunds').doc(id);
  await ref.update(data);
  
  console.log(`Updated credit refund ${id} in Firestore`);
  
  return { success: true, id, ...data }
})

