import { fs } from '../../utils/firebase'

export default defineEventHandler(async event =>
{
  const { invoiceKey, data } = await readBody(event)
  await fs.collection('/invoices').doc(invoiceKey).update(data);
  return invoiceKey
})