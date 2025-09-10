import { fs } from '../../utils/firebase'

export default defineEventHandler(async event =>
{
  const { presaleKey, data } = await readBody(event)
  await fs.collection('/presales').doc(presaleKey).update(data);
  return presaleKey
})