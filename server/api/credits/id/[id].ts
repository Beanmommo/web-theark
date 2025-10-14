import { db, fs } from '../../../utils/firebase'
import type { CreditPackage } from '~/types/data'

export default defineEventHandler(async event =>
{
  const id = getRouterParam(event, 'id')
  if (!id) return null

  // Try to fetch from Firestore first (primary database)
  const fsRef = fs.collection('creditPackages').doc(id);

  try
  {
    const doc = await fsRef.get();

    if (doc.exists)
    {
      console.log(`Found credit package ${id} in Firestore`);
      return { id: doc.id, ...doc.data() } as CreditPackage;
    }
  } catch (error)
  {
    console.log('Firestore read failed:', error);
  }

  // If not found in Firestore, try Realtime Database
  const rtdbRef = db.ref('creditPackages/' + id);

  try
  {
    const snapshot = await rtdbRef.once('value');

    if (snapshot.exists())
    {
      console.log(`Found credit package ${id} in RTDB`);
      return { key: id, ...snapshot.val() } as CreditPackage;
    }
  } catch (error)
  {
    console.log('RTDB read failed:', error);
  }

  // If not found in either database
  console.log(`Warning: Credit package ${id} not found in either database`);
  return null
})

