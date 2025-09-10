
import { ref as firebaseRef, onValue, set } from "firebase/database";


export const usePaynowsStore = defineStore('paynows', () =>
{
  const paid = ref(false)
  const { $fireDb } = useNuxtApp();
  function listenPaymentStatus(presaleKey: string)
  {
    const paynowRef = firebaseRef($fireDb, 'paynows/' + presaleKey + '/paymentStatus')
    onValue(paynowRef, (snapshot) =>
    {
      const data = snapshot.val()
      if (data === 'Paid') paid.value = true
    })
  }

  function addPaynow(presaleKey: string)
  {
    paid.value = false
    const paynowRef = firebaseRef($fireDb, 'paynows/' + presaleKey)
    set(paynowRef, {
      paymentStatus: 'Unpaid'
    })
  }
  return { paid, addPaynow, listenPaymentStatus }
})