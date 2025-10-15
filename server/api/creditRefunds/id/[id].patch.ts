import { db, fs } from '../../../utils/firebase'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')
  if (!id) return { error: 'ID is required' }
  
  const data = await readBody(event)
  
  // 1. Try Firestore creditRefunds first (new refunds)
  const fsRefundsRef = fs.collection('creditRefunds').doc(id);
  
  try {
    const doc = await fsRefundsRef.get();
    
    if (doc.exists) {
      await fsRefundsRef.update(data);
      console.log(`[PATCH] Updated credit refund ${id} in Firestore creditRefunds`);
      return { success: true, database: 'firestore-creditRefunds', id, ...data };
    }
  } catch (error) {
    console.log('Firestore creditRefunds update failed:', error);
  }
  
  // 2. Try Firestore creditPackages (legacy refunds with paymentMethod === "Refund")
  const fsPackagesRef = fs.collection('creditPackages').doc(id);
  
  try {
    const doc = await fsPackagesRef.get();
    
    if (doc.exists) {
      await fsPackagesRef.update(data);
      console.log(`[PATCH] Updated credit refund ${id} in Firestore creditPackages (legacy)`);
      return { success: true, database: 'firestore-creditPackages', id, ...data };
    }
  } catch (error) {
    console.log('Firestore creditPackages update failed:', error);
  }
  
  // 3. Try RTDB creditPackages (oldest legacy refunds)
  const rtdbRef = db.ref('creditPackages/' + id);
  
  try {
    const snapshot = await rtdbRef.once('value');
    
    if (snapshot.exists()) {
      await rtdbRef.update(data);
      console.log(`[PATCH] Updated credit refund ${id} in RTDB creditPackages (legacy)`);
      return { success: true, database: 'rtdb-creditPackages', id, ...data };
    }
  } catch (error) {
    console.log('RTDB creditPackages update failed:', error);
  }
  
  // 4. Not found in any database
  console.log(`[PATCH] Warning: Credit refund ${id} not found in any database`);
  return { success: false, error: 'Credit refund not found', id, ...data };
})

