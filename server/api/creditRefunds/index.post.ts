import { fs } from '../../utils/firebase'

export default defineEventHandler(async event =>
{
  const creditRefund = await readBody(event)
  
  // Save to Firestore creditRefunds collection
  const ref = fs.collection('creditRefunds');
  const creditRefundRef = await ref.add(creditRefund);
  
  console.log(`Created credit refund ${creditRefundRef.id} in Firestore`);
  
  return creditRefundRef.id
})

