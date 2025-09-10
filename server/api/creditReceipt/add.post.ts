import { fs } from '../../utils/firebase'

export default defineEventHandler(async event =>
{
  const creditReceiptData = await readBody(event)
  await fs.collection('/creditReceipts').doc(creditReceiptData.id).set(creditReceiptData);
  return creditReceiptData
})