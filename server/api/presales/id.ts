import { fs } from '../../utils/firebase'

export default defineEventHandler(async () =>
{
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const yearMonth = `${year}${month}`
  const counterRef = fs.doc(`presalesCounters/${yearMonth}`)

  let newPresaleId: string

  try {
    newPresaleId = await fs.runTransaction(async (transaction) =>
    {
      const counterDoc = await transaction.get(counterRef)
      let newCount = 1

      // Always check for existing presales to ensure counter is in sync
      const ref = fs.collection('presales')
      const yearMonthEnd = `${yearMonth}999`

      const snapshot = await ref
        .where('__name__', '>=', yearMonth)
        .where('__name__', '<', yearMonthEnd)
        .orderBy('__name__', 'desc')
        .limit(1)
        .get()

      let actualHighestCount = 0
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        let lastId = doc.id.includes('t-') ? doc.id.split('t-')[1] : doc.id
        // Extract the counter part (last 3 digits)
        actualHighestCount = parseInt(lastId.slice(6))
      }

      if (counterDoc.exists) {
        const data = counterDoc.data()
        const counterValue = data?.count || 0
        // Use the higher of the two values to ensure we don't create duplicate IDs
        newCount = Math.max(counterValue, actualHighestCount) + 1
      } else {
        newCount = actualHighestCount + 1
      }

      transaction.set(counterRef, { count: newCount }, { merge: true })
      return `${yearMonth}${newCount.toString().padStart(3, '0')}`
    })
  }
  catch (e) {
    // fallback logic for safety — legacy method
    const ref = fs.collection('presales')
    const yearMonthEnd = `${yearMonth}999`

    const snapshot = await ref
      .where('__name__', '>=', yearMonth)
      .where('__name__', '<', yearMonthEnd)
      .orderBy('__name__', 'desc')
      .limit(1)
      .get()

    if (snapshot.empty) {
      newPresaleId = `${yearMonth}001`
    } else {
      const doc = snapshot.docs[0]
      let lastId = doc.id.includes('t-') ? doc.id.split('t-')[1] : doc.id
      const nextIndex = (parseInt(lastId.slice(6)) + 1).toString().padStart(3, '0')
      newPresaleId = `${yearMonth}${nextIndex}`
    }

    // Try to update the counter with the correct value for future use
    try {
      const nextCounter = parseInt(newPresaleId.slice(6))
      await counterRef.set({ count: nextCounter }, { merge: true })
    } catch (updateError) {
      console.warn('Failed to update counter after fallback:', updateError)
    }
  }

  return newPresaleId
})
