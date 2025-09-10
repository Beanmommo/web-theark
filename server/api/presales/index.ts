import { fs } from '../../utils/firebase'

export default defineEventHandler(async event =>
{
  const presaleData = await readBody(event)
  fs.collection('/presales').doc(presaleData.id).set(presaleData);
  return presaleData
})