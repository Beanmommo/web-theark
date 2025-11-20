import { fs } from '../../utils/firebase'
import type { CreditReceipt } from '~/types/data'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) return null

  // Fetch from Firestore creditReceipts collection
  const ref = fs.collection('creditReceipts').doc(id)

  try {
    const doc = await ref.get()

    if (doc.exists) {
      console.log(`Found credit receipt ${id} in Firestore`)
      return { id: doc.id, ...doc.data() } as CreditReceipt
    }
  } catch (error) {
    console.log('Firestore read failed:', error)
  }

  // If not found
  console.log(`Warning: Credit receipt ${id} not found`)
  return null
})

