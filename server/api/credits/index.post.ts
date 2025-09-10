import { db } from '../../utils/firebase'

export default defineEventHandler(async event =>
{
  const creditPackage = await readBody(event)

  const ref = db.ref('creditPackages');
  const creditPackageRef = ref.push(creditPackage)
  return creditPackageRef.key
})