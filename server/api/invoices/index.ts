import { fs } from '../../utils/firebase'

export default defineEventHandler(async event =>
{
  const invoiceData = await readBody(event)
  await fs.collection('/invoices').doc(invoiceData.id).set(invoiceData);
  return invoiceData
})