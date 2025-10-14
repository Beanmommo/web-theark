import { fs } from '../../utils/firebase'
import type { CreditRefundData, CreditRefund } from '~/types/data'

export default defineEventHandler(async event =>
{
  const userKey = getRouterParam(event, 'userKey')
  if (!userKey) return {}
  
  const ref = fs.collection('creditRefunds');
  const snapshot = await ref.where('userKey', '==', userKey).get();
  
  const creditRefunds: CreditRefundData = {};
  snapshot.forEach(doc =>
  {
    creditRefunds[doc.id] = { 
      ...doc.data() as CreditRefund, 
      key: doc.id 
    };
  });
  
  console.log(`Fetched ${Object.keys(creditRefunds).length} credit refunds for user ${userKey}`);
  
  return creditRefunds
})

