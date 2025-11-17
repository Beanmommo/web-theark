<script setup lang="ts">
import {
  type PackageDetails,
  PaymentMethods,
  type Invoice,
  InvoiceType,
} from "../types/data";
import { useReCaptchaHandler } from "../composables/useRecaptchaHandler";

const props = defineProps({
  packageItem: {
    type: Object as PropType<PackageDetails>,
    required: true,
  },
});

const emit = defineEmits(["back", "submit"]);
const { verifyRecaptcha } = useReCaptchaHandler();

// Composables
const {
  updateSubtotalPackage,
  updateTotalPayable,
  updateCreditCardFee,
  removeCreditCardFee,
  totalCostData,
} = usePayment();
const user = useAuthUser();
const router = useRouter();

// Stores
const presalesStore = usePresalesStore();
const paymentsStore = usePaymentsStore();
const invoicesStore = useInvoicesStore();
const paynowsStore = usePaynowsStore();
const creditsStore = useCreditsStore();
const { customerData } = storeToRefs(presalesStore);

// Reactive Data
const checklist = ref(false);
const creditCardValid = ref(false);
const paymentMethod = ref();
const loading = ref(false);
const message = ref("");

onMounted(() => {
  initialiseUserDetailsPresalesStore();
  updateSubtotalPackage(props.packageItem);
});

const formCompleted = computed(() => {
  return checklist.value;
});

const userDetailsCompleted = computed(() => {
  return user.value?.phoneNumber && user.value?.displayName;
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

function updateCardValidity(valid: boolean) {
  creditCardValid.value = valid;
}

function updateHandlerPaymentSelection(paymentMode: PaymentMethods) {
  paymentMethod.value = paymentMode;
  updateTotalPayable();
  if (paymentMode === PaymentMethods.CREDIT_CARD) updateCreditCardFee();
  else if (paymentMode === PaymentMethods.PAYNOW) removeCreditCardFee();
  presalesStore.updateTotalCostData(totalCostData.value);
  presalesStore.updatePaymentData({
    paymentMethod: paymentMode,
    paymentStatus: "Unpaid",
  });
}

function updateHandlerCheckList(result: boolean) {
  checklist.value = result;
}

async function handleCreditCardPayment(newInvoiceData: Partial<Invoice>) {
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
    message.value = "Payment failed. Please try again.";
    return null;
  }
}

async function clickHandlerSubmit() {
  // Set Loading State with loading message
  loading.value = true;
  message.value = "Submitting your purchase...";

  // Check Recaptcha
  const recaptchaResult = await verifyRecaptcha("submit_form");
  if (!recaptchaResult.success) {
    alert(recaptchaResult.error);
    loading.value = false;
    return;
  }
  let newPresaleData = await presalesStore.addPackagePresale();
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
      invoiceType: InvoiceType.CREDITPACKAGE,
    };
    const finalInvoiceData = await invoicesStore.addInvoice(newInvoiceData);

    const creditPackageKey = await creditsStore.addCreditPackage(
      finalInvoiceData,
      props.packageItem
    );
    if (creditPackageKey)
      await invoicesStore.updateInvoiceCreditPackageKey(
        finalInvoiceData.id,
        creditPackageKey
      );
    router.push("/packages/thankyou");
    loading.value = false;
  } else if (paymentMethod.value === PaymentMethods.PAYNOW) {
    paynowsStore.addPaynow(newPresaleData.id);
    paynowsStore.listenPaymentStatus(newPresaleData.id);
    emit("submit", newPresaleData);
  }
  loading.value = false;
}
</script>

<template>
  <div class="packagePurchasePage3">
    <Loading :message="message" v-if="loading" />
    <PackagePurchasePage3Details
      :packageItem="packageItem"
      v-if="packageItem"
    />
    <UserDetailsForm />
    <template v-if="userDetailsCompleted">
      <PaymentSelection @update="updateHandlerPaymentSelection" />
    </template>
    <template v-if="paymentMethod">
      <template v-if="paymentMethod === PaymentMethods.CREDIT_CARD">
        <PackagePurchasePage3CreditCardDetails @update="updateCardValidity" />
      </template>
      <PackagePurchasePage3PaymentSummary :totalCostData="totalCostData" />
      <PackagePurchasePage3CheckList @update="updateHandlerCheckList" />
    </template>
    <div class="buttons">
      <Button :disabled="!formCompleted || loading" @click="clickHandlerSubmit"
        >Confirm My Purchase</Button
      >
      <Button @click="$emit('back')">Back to Package Selection</Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.packagePurchasePage3 {
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
