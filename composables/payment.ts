import { ref } from 'vue'
import type { TotalCostData, PromoCode, GroupedTimeslots, PackageDetails } from '~/types/data'

export const usePayment = () =>
{
  const gstPercentage = 9
  const cardTransactionPercentage = 5
  const totalCostData = ref({
    subtotal: 0,
    totalPayable: 0,
    discount: 0,
    gst: 0,
    total: 0,
    gstPercentage,
    promocode: '',
    transactionFee: 0,
    transactionPercentage: 0
  } as TotalCostData)


  function updatePromoCodeDiscount(promoCode: string, discount: number)
  {
    totalCostData.value.promocode = promoCode
    totalCostData.value.discount = discount
    totalCostData.value.total = totalCostData.value.subtotal - discount
  }

  function removePromoCodeDiscount()
  {
    totalCostData.value.promocode = ''
    totalCostData.value.discount = 0
    totalCostData.value.total = totalCostData.value.subtotal
  }

  function updateSubtotal(groupedTimeslots: GroupedTimeslots)
  {
    totalCostData.value.subtotal = getSubtotal(groupedTimeslots)
    totalCostData.value.total = totalCostData.value.subtotal
  }

  function updateSubtotalPackage(packageItem: PackageDetails)
  {
    totalCostData.value.subtotal = parseInt(packageItem.amount)
    totalCostData.value.total = totalCostData.value.subtotal
  }

  function updateTotalPayable()
  {
    totalCostData.value.gst = getGST(totalCostData.value.total)
    const totalPayable = totalCostData.value.total + totalCostData.value.gst
    const roundedTotalPayable = Math.round(totalPayable * 100) / 100
    totalCostData.value.totalPayable = roundedTotalPayable
  }

  function updateMembershipCreditTotalPayable() 
  {
    totalCostData.value.totalPayable = totalCostData.value.total
  }

  function updateCreditCardFee()
  {
    totalCostData.value.transactionPercentage = cardTransactionPercentage
    totalCostData.value.transactionFee = Math.round((totalCostData.value.total * totalCostData.value.transactionPercentage)) / 100
    totalCostData.value.total = totalCostData.value.total + totalCostData.value.transactionFee
    updateTotalPayable()
  }

  function removeCreditCardFee()
  {
    totalCostData.value.total = totalCostData.value.total - totalCostData.value.transactionFee
    updateTotalPayable()
    totalCostData.value.transactionPercentage = 0
    totalCostData.value.transactionFee = 0
  }

  function updateMembershipCredit()
  {
    totalCostData.value.total = totalCostData.value.subtotal - totalCostData.value.discount
    totalCostData.value.transactionPercentage = 0
    totalCostData.value.transactionFee = 0
    totalCostData.value.gst = 0
    totalCostData.value.totalPayable = totalCostData.value.total
 
  }

  function getGST(total: number)
  {
    return Math.round(total * gstPercentage) / 100;
  }

  function getSubtotal(groupedTimeslots: GroupedTimeslots)
  {
    return Object.keys(groupedTimeslots).reduce((total, date) =>
    {
      return total + groupedTimeslots[date].reduce((acc, slot) =>
      {
        return acc + slot.rate;
      }, 0);
    }, 0);
  }

  function getDiscount(groupedTimeslots: GroupedTimeslots, promocode: PromoCode)
  {
    const { timeslotTypes, value, type, targetPitches, targetSpecificPitches, typeOfSports } = promocode;
    let discount = 0;
    Object.keys(groupedTimeslots).forEach((key) =>
    {
      let timeslots = groupedTimeslots[key];
      timeslots.forEach((timeslot) =>
      {
        // Check timeslot type matching (existing logic)
        if (!timeslotTypes.includes(timeslot.type)) return;

        // Check pitch targeting (if enabled)
        if (targetSpecificPitches && targetPitches && targetPitches.length > 0) {
          const pitchStr = String(timeslot.pitch);
          const pitchMatches = targetPitches.some(targetPitch =>
            pitchStr === targetPitch || pitchStr.includes(targetPitch)
          );
          if (!pitchMatches) return;
        }

        // Check sport type targeting (if configured)
        if (typeOfSports && typeOfSports.length > 0) {
          const slotSport = (timeslot.typeOfSports || 'futsal').toLowerCase();
          const sportMatches = typeOfSports.some(targetSport =>
            targetSport.toLowerCase() === slotSport
          );
          if (!sportMatches) return;
        }

        // Calculate discount for matching timeslots
        if (type === "Amount")
        {
          discount = parseInt(value);
        } else if (type === "Percentage")
        {
          discount += (timeslot.rate * parseInt(value)) / 100;
        } else if (type === "Session")
        {
          discount += parseInt(value);
        }
      });
    });
    return discount;
  }
  return {
    gstPercentage,
    totalCostData,
    updateSubtotal,
    updateSubtotalPackage,
    updatePromoCodeDiscount,
    updateTotalPayable,
    updateCreditCardFee,
    updateMembershipCredit,
    removeCreditCardFee,
    updateMembershipCreditTotalPayable,
    removePromoCodeDiscount,
    getDiscount
  }
}