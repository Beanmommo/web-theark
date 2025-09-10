import { db } from '../../utils/firebase'
import { type BookedSlot } from '../../../types/data'
export default defineEventHandler(async event =>
{
  const slots = await readBody(event)
  const ref = db.ref('/bookedSlots');
  const updates: { [key: string]: {} } = {}
  const slotKeys: string[] = []
  slots.forEach((slot: BookedSlot) =>
  {
    //const newKey = '-OG4CKsKu8Wx438eZ9QT'
    const newKey = ref.push().key
    if (!newKey) return
    slotKeys.push(newKey)
    updates[newKey] = slot
  })
  await ref.update(updates)
  return slotKeys
})