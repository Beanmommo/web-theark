<script setup lang="ts">
import {
  type GroupedTimeslots,
  type PromoCode,
  PaymentMethods,
  InvoiceType,
  type BookingDetails,
  type InvoiceBooking,
  type PresaleBooking,
} from "~/types/data";
import { usePayment } from "~/composables/payment";
import { useGoTo } from "vuetify";
import { useReCaptchaHandler } from "../composables/useRecaptchaHandler";

const props = defineProps({
  groupedTimeslots: {
    type: Object as PropType<GroupedTimeslots>,
    default: {},
  },
});
const emit = defineEmits(["back", "submit"]);
const { verifyRecaptcha } = useReCaptchaHandler();
const route = useRoute();
const sport = route.params.sportSlug as string;

// Composables
const {
  getDiscount,
  updatePromoCodeDiscount,
  updateSubtotal,
  updateTotalPayable,
  updateCreditCardFee,
  removeCreditCardFee,
  removePromoCodeDiscount,
  updateMembershipCredit,
  updateMembershipCreditTotalPayable,
  totalCostData,
} = usePayment();
const user = useAuthUser();
const dayjs = useDayjs();
const router = useRouter();
const goTo = useGoTo();

// Stores
const creditsStore = useCreditsStore();
const { totalCreditsLeft, currentUserPackages, currentCreditRefunds } =
  storeToRefs(creditsStore);
const presalesStore = usePresalesStore();
const invoicesStore = useInvoicesStore();
const bookedSlotsStore = useBookedSlotsStore();
const { customerData, bookingDetails, presaleData } =
  storeToRefs(presalesStore);
const paymentsStore = usePaymentsStore();
const bookingsStore = useBookingsStore();
const paynowsStore = usePaynowsStore();

// Reactive Data
const loading = ref(false);
const message = ref("");
const paymentError = ref(false);
const paymentErrorMessage = ref("");
const checklist = ref(false);
const paymentMethod = ref<PaymentMethods>();
const creditCardValid = ref(false);
const slotsBooked = ref(false);

onMounted(async () => {
  loading.value = true;
  await creditsStore.fetchUserCreditsAndRefunds();
  initialiseUserDetailsPresalesStore();
  updateSubtotal(props.groupedTimeslots);
  goTo("#booking");
  loading.value = false;
});

const userDetailsCompleted = computed(() => {
  return user.value?.phoneNumber && user.value?.displayName;
});

const formCompleted = computed(() => {
  return (
    checklist.value &&
    paymentMethod.value &&
    ((paymentMethod.value === PaymentMethods.CREDIT_CARD &&
      creditCardValid.value) ||
      paymentMethod.value === PaymentMethods.PAYNOW ||
      paymentMethod.value === PaymentMethods.MEMBERSHIP_CREDIT)
  );
});

function initialiseUserDetailsPresalesStore() {
  const customerDetails = {
    name: user.value?.displayName,
    email: user.value?.email,
    contact: user.value?.phoneNumber,
    userId: user.value?.uid,
  };
  presalesStore.updateCustomerData(customerDetails);
}

function updateHandlerPromoCode(promo: PromoCode) {
  if (Object.keys(promo).length !== 0) {
    const discount = getDiscount(props.groupedTimeslots, promo);
    updatePromoCodeDiscount(promo.promocode, discount);
  } else {
    removePromoCodeDiscount();
  }
  if (paymentMethod.value === PaymentMethods.MEMBERSHIP_CREDIT)
    updateMembershipCreditTotalPayable();
  else updateTotalPayable();
  if (paymentMethod.value === PaymentMethods.CREDIT_CARD) updateCreditCardFee();
  presalesStore.updateTotalCostData(totalCostData.value);
}

function updateHandlerCheckList(result: boolean) {
  checklist.value = result;
}

function updateHandlerPaymentSelection(paymentMode: PaymentMethods) {
  paymentMethod.value = paymentMode;
  if (paymentMode === PaymentMethods.MEMBERSHIP_CREDIT)
    updateMembershipCredit();
  else {
    updateTotalPayable();
    if (paymentMode === PaymentMethods.CREDIT_CARD) updateCreditCardFee();
    else if (paymentMode === PaymentMethods.PAYNOW) removeCreditCardFee();
  }
  presalesStore.updateTotalCostData(totalCostData.value);
  presalesStore.updatePaymentData({
    paymentMethod: paymentMode,
    paymentStatus: "Unpaid",
  });
}

function updateCardValidity(valid: boolean) {
  creditCardValid.value = valid;
}

async function handleCreditCardPayment(
  newInvoiceData: Partial<InvoiceBooking>
) {
  if (!newInvoiceData.presaleId || !newInvoiceData.totalPayable) return; // Need to add error handling if newInvoiceData is not created
  const result = await paymentsStore.confirmCardPayment(
    newInvoiceData.presaleId,
    newInvoiceData.totalPayable,
    customerData.value,
    newInvoiceData.databaseVersion
  );
  if (result.status === "succeeded") {
    return {
      paymentIntentId: result.id,
      paymentMethodId: result.payment_method as string,
    };
  } else {
    paymentError.value = true;
    paymentErrorMessage.value = "Payment failed. Please try again.";
    return null;
  }
}

async function handleMembershipCreditPayment() {
  let remaining = totalCostData.value.totalPayable;
  let promises: Promise<any>[] = [];
  const creditPackageKeys: string[] = [];

  // Combine credits: refunds first (sorted by expiry), then purchased (sorted by expiry)
  const refunds = currentCreditRefunds.value
    .map((refund) => ({ ...refund, isRefund: true }))
    .sort((a, b) => dayjs(a.expiryDate).diff(dayjs(b.expiryDate)));

  const purchased = currentUserPackages.value
    .map((pkg) => ({ ...pkg, isRefund: false }))
    .sort((a, b) => dayjs(a.expiryDate).diff(dayjs(b.expiryDate)));

  // Refunds first, then purchased
  const allCredits = [...refunds, ...purchased];

  allCredits.forEach(async (item) => {
    if (remaining === 0) return;

    const creditsLeft = Number(item.creditsLeft) || Number(item.value);
    let creditPackageCreditsLeft = 0;

    if (creditsLeft >= remaining) {
      creditPackageCreditsLeft = creditsLeft - remaining;
      remaining = 0;
    } else if (creditsLeft < remaining) {
      remaining -= creditsLeft;
      creditPackageCreditsLeft = 0;
    }

    if (item.key) {
      // Check if it's a refund credit or purchased credit
      if (item.isRefund) {
        // Smart update: tries creditRefunds first, then creditPackages
        promises.push(
          creditsStore.updateCreditRefund({
            key: item.key,
            creditsLeft: creditPackageCreditsLeft,
          })
        );
      } else {
        promises.push(
          creditsStore.updateCreditPackage({
            key: item.key,
            creditsLeft: creditPackageCreditsLeft,
          })
        );
      }

      creditPackageKeys.push(item.key);
    }
  });

  await Promise.all(promises);
  return creditPackageKeys;
}

async function checkBookingSlots() {
  const bookedSlots = await bookedSlotsStore.fetchBookedSlotsByDate(
    bookingDetails.value.date,
    bookingDetails.value.location,
    sport
  );
  let booked = false;
  if (bookedSlots)
    Object.keys(props.groupedTimeslots).forEach((date) => {
      let slots = props.groupedTimeslots[date];
      slots.forEach(({ pitch, start, date }) => {
        const found = bookedSlots.find(
          (slot) =>
            slot.start === start &&
            slot.pitch === pitch &&
            dayjs(slot.date).format("YYYY-MM-DD") === date
        );
        if (found) booked = true;
      });
    });
  return booked;
}

async function clickHandlerSubmit() {
  if (presaleData.value.total === 0) return;
  if (loading.value) return; // Prevent double submission
  // Set Loading State with loading message
  loading.value = true;
  message.value = "Submitting your booking...";
  paymentError.value = false;
  paymentErrorMessage.value = "";

  // Check Recaptcha - TODO: re-enable later when .env RECAPTCHA_SECRET_KEY is added
  const recaptchaResult = await verifyRecaptcha("submit_form");
  if (!recaptchaResult.success) {
    alert(recaptchaResult.error);
    loading.value = false;
    return;
  }

  // Check whether slots is still available
  const slotsNotAvailable = await checkBookingSlots();
  slotsBooked.value = slotsNotAvailable;
  // Show Error message if slots are not available
  if (slotsBooked.value) {
    message.value = "Slots have been booked. Please select other slots";
    loading.value = false;
    const newBookingDetails: BookingDetails = {
      location: bookingDetails.value.location,
      slots: [],
      date: bookingDetails.value.date,
      typeOfSports: sport,
    };
    presalesStore.updateBookingDetails(newBookingDetails);
    return;
  }

  // Add Pending Booked Slots
  const slotKeys = await bookedSlotsStore.addPendingBookedSlots(
    presaleData.value,
    props.groupedTimeslots
  );

  // Payment Process for Membership Credit
  if (paymentMethod.value === PaymentMethods.MEMBERSHIP_CREDIT) {
    await creditsStore.fetchUserCreditsAndRefunds();
    const creditPackageData: InvoiceBooking = {
      ...presaleData.value,
      slotKeys,
      invoiceType: InvoiceType.BOOKING,
      paymentStatus: "Paid",
      submittedDate: dayjs().format(),
      typeOfSports: presaleData.value.typeOfSports?.toLowerCase() || "futsal",
      slots: presaleData.value.slots?.map((slot) => ({
        ...slot,
        typeOfSports: slot.typeOfSports?.toLowerCase() || "futsal",
      })),
    };
    const remainingCredits =
      totalCreditsLeft.value - totalCostData.value.totalPayable;
    const creditPackageKeys = await handleMembershipCreditPayment();
    await creditsStore.addCreditReceipt(
      creditPackageData,
      remainingCredits,
      creditPackageKeys
    );
    const bookingKey = await bookingsStore.addBooking(
      creditPackageData,
      slotKeys,
      sport
    );
    if (bookingKey) {
      const automateSlots = await bookedSlotsStore.updateBookedSlots(
        creditPackageData,
        slotKeys,
        bookingKey
      );
      await bookedSlotsStore.addAutomateSlots(automateSlots);
    }
    router.push(`/${sport}/booking/thankyou`);
    loading.value = false;
    return;
  }

  // Payment Process for Credit Card & PayNow
  presalesStore.updateSlotKeys(slotKeys);
  let newPresaleData = await presalesStore.addPresale();

  // Payment Process for Credit Card
  if (paymentMethod.value === PaymentMethods.CREDIT_CARD) {
    const stripePaymentDetails = await handleCreditCardPayment(newPresaleData);
    if (!stripePaymentDetails) {
      loading.value = false;
      return;
    }
    const newInvoiceData = {
      ...newPresaleData,
      paymentDetails: stripePaymentDetails,
      paymentStatus: "Paid",
      invoiceType: InvoiceType.BOOKING,
      typeOfSports: presaleData.value.typeOfSports?.toLowerCase() || "futsal",
      slots: presaleData.value.slots?.map((slot) => ({
        ...slot,
        typeOfSports: slot.typeOfSports?.toLowerCase() || "futsal",
      })),
    };
    const finalInvoiceData = await invoicesStore.addInvoice(newInvoiceData);
    if (slotKeys.length > 0) {
      const bookingKey = await bookingsStore.addBooking(
        finalInvoiceData,
        slotKeys,
        sport
      );
      if (bookingKey) {
        await invoicesStore.updateInvoiceBookingKey(
          finalInvoiceData.id,
          bookingKey
        );
        const automateSlots = await bookedSlotsStore.updateBookedSlots(
          finalInvoiceData,
          slotKeys,
          bookingKey
        );
        await bookedSlotsStore.addAutomateSlots(automateSlots);
      }
    }
    await presalesStore.updatePresale(newPresaleData.id);
    router.push(`/${sport}/booking/thankyou`);
    loading.value = false;
  }

  // Payment Process for PayNow
  else if (paymentMethod.value === PaymentMethods.PAYNOW) {
    paynowsStore.addPaynow(newPresaleData.id);
    paynowsStore.listenPaymentStatus(newPresaleData.id);
    emit("submit", newPresaleData);
  }
}
</script>

<template>
  <div class="bookingFormPage3">
    <Loading :message="message" v-if="loading" />
    <BookingFormPage3Details :groupedTimeslots="groupedTimeslots" />
    <BookingFormPage3UserDetails />
    <template v-if="userDetailsCompleted">
      <BookingFormPage3PromoCode @update="updateHandlerPromoCode" />

      <!-- Show credit packages when Membership Credit is available -->
      <BookingFormPage3CreditPackages v-if="totalCreditsLeft > 0" />

      <BookingFormPage3PaymentSelection
        @update="updateHandlerPaymentSelection"
        :totalCostData="totalCostData"
      />
    </template>
    <template v-if="paymentMethod">
      <template v-if="paymentMethod === PaymentMethods.CREDIT_CARD">
        <BookingFormPage3CreditCardDetails @update="updateCardValidity" />
      </template>
      <BookingFormPage3PaymentSummary />
      <BookingFormPage3CheckList @update="updateHandlerCheckList" />
      <ButtonRecaptcha />
    </template>
    <AlertError v-if="paymentError">{{ paymentErrorMessage }}</AlertError>
    <AlertError v-if="slotsBooked"
      >Slots have been booked. Please select other slots.</AlertError
    >
    <div class="buttons">
      <Button
        :disabled="!formCompleted || slotsBooked || loading"
        @click="clickHandlerSubmit"
        >Confirm My Booking</Button
      >
      <Button @click="$emit('back')">Back to Booking Selection</Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bookingFormPage3 {
  display: grid;
  margin: $margin auto;
  max-width: $main-max;
  padding: $margin;
  grid-gap: $p-margin;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: $margin;
}
</style>
