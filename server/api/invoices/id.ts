import { fs } from '../../utils/firebase'

export default defineEventHandler(async () =>
{
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const yearMonth = `${year}${month}`
  const prefix = 'ark'
  const counterId = `${prefix}-${yearMonth}`
  const counterRef = fs.doc(`invoiceCounters/${counterId}`)

  let newInvoiceId: string

  try {
    newInvoiceId = await fs.runTransaction(async (transaction) =>
    {
      const counterDoc = await transaction.get(counterRef)
      let count = 1

      // Always check for existing invoices to ensure counter is in sync
      const ref = fs.collection('invoices')
      const startAt = `${prefix}-${yearMonth}`
      const endAt = `${prefix}-${yearMonth}999`

      const snapshot = await ref
        .where('__name__', '>=', startAt)
        .where('__name__', '<', endAt)
        .orderBy('__name__', 'desc')
        .limit(1)
        .get()

      let actualHighestCount = 0
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        let lastId = doc.id.includes('ark-') ? doc.id.split('ark-')[1] : doc.id
        // Extract the counter part (last 3 digits)
        actualHighestCount = parseInt(lastId.slice(6))
      }

      if (counterDoc.exists) {
        const data = counterDoc.data()
        const counterValue = data?.count || 0
        // Use the higher of the two values to ensure we don't create duplicate IDs
        count = Math.max(counterValue, actualHighestCount) + 1
      } else {
        count = actualHighestCount + 1
      }

      transaction.set(counterRef, { count }, { merge: true })

      const padded = count.toString().padStart(3, '0')
      return `${prefix}-${yearMonth}${padded}`
    })
  }
  catch (e) {
    // fallback to legacy logic
    const ref = fs.collection('invoices')
    const startAt = `${prefix}-${yearMonth}`
    const endAt = `${prefix}-${yearMonth}999`

    const snapshot = await ref
      .where('__name__', '>=', startAt)
      .where('__name__', '<', endAt)
      .orderBy('__name__', 'desc')
      .limit(1)
      .get()

    if (snapshot.empty) {
      newInvoiceId = `${prefix}-${yearMonth}001`
    } else {
      const doc = snapshot.docs[0]
      let lastId = doc.id.includes('ark-') ? doc.id.split('ark-')[1] : doc.id
      const index = parseInt(lastId.slice(6)) + 1
      newInvoiceId = `${prefix}-${yearMonth}${index.toString().padStart(3, '0')}`
    }

    // Try to update the counter with the correct value for future use
    try {
      const nextCounter = parseInt(newInvoiceId.split('-')[1].slice(6))
      await counterRef.set({ count: nextCounter }, { merge: true })
    } catch (updateError) {
      console.warn('Failed to update invoice counter after fallback:', updateError)
    }
  }

  return newInvoiceId
})
