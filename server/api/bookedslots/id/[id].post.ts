import { db } from '../../../utils/firebase'
export default defineEventHandler(async event =>
{
  const id = getRouterParam(event, 'id')
  const slot = await readBody(event)
  const ref = db.ref('bookedSlots/' + id);
  await ref.update(slot)
  return slot
})