import { db } from '../../../utils/firebase'
export default defineEventHandler(async event =>
{
  const id = getRouterParam(event, 'id')
  const data = await readBody(event)
  const ref = db.ref('creditPackages/' + id);
  await ref.update(data)
  return id
})