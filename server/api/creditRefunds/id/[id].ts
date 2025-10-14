import { fs } from '../../../utils/firebase'
import type { CreditRefund } from '~/types/data'

export default defineEventHandler(async event =>
{
  const id = getRouterParam(event, 'id')
  if (!id) return null
  
  const ref = fs.collection('creditRefunds').doc(id);
  const doc = await ref.get();
  
  if (doc.exists)
  {
    console.log(`Found credit refund ${id} in Firestore`);
    return { id: doc.id, ...doc.data() } as CreditRefund;
  }
  
  console.log(`Warning: Credit refund ${id} not found`);
  return null
})

