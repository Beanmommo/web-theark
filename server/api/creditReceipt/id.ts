import { fs } from '../../utils/firebase'


export default defineEventHandler(async event =>
{
  const ref = fs.collection('creditReceipts');

  const date = new Date()
  const currentMonth = date.getMonth() + 1
  const currentYear = date.getFullYear()
  const yearMonthString = `cr-${currentYear}${currentMonth.toString().padStart(2, '0')}`
  const yearMonthStringEnd = `cr-${yearMonthString}999`

  const creditReceiptData = new Promise((resolve, reject) =>
    ref
      .where("__name__", ">=", yearMonthString) // Start with the given YYYYMM
      .where("__name__", "<", yearMonthStringEnd) // End at the next YYYYMM range
      .orderBy("__name__", "desc") // Order by ID descending
      .limit(1)
      .get().then((querySnapshot) =>
      {
        if (querySnapshot.empty)
        {
          const newCreditReceiptId = `cr-${currentYear}${currentMonth.toString().padStart(2, '0')}001`
          resolve(newCreditReceiptId)
        }
        querySnapshot.forEach((doc) =>
        {
          let lastCreditReceiptId = doc.id
          if (doc.id.includes("cr-"))
            lastCreditReceiptId = doc.id.split("cr-")[1]
          const newCreditReceiptId = getCreditReceiptId(lastCreditReceiptId)
          resolve(newCreditReceiptId)
        })
      })
      .catch((error) =>
      {
        console.log("Error getting documents: ", error);
      })
  )

  function getCreditReceiptId(docId: string)
  {
    const year = parseInt(docId.slice(0, 4))
    const month = parseInt(docId.slice(4, 6))
    const index = docId.slice(6)
    const idYear = year < currentYear ? currentYear : year
    const idMonth = month < currentMonth ? currentMonth : month
    const newId = (parseInt(index) + 1).toString().padStart(3, '0')
    return `cr-${idYear}${idMonth.toString().padStart(2, "0")}${newId}`
  }
  return creditReceiptData

})
