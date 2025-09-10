<script setup lang="ts">
import { usePaynowsStore } from "~/stores/paynows";
import { storeToRefs } from 'pinia'
import PaynowQR from "paynowqr";
import type { Invoice } from '../types/data'

const props = defineProps({
  invoiceData: {
    type: Object as PropType<Invoice>,
    default: {}
  }
})

const router = useRouter()
const paynowsStore = usePaynowsStore()
const { paid } = storeToRefs(paynowsStore)
const dayjs = useDayjs()
const expiryTime = ref(dayjs().add(10, "minutes"))

watch(paid, (value) =>
{
  if (value) router.push('/booking/thankyou')
})

const qrcode = computed(() =>
{
  let qrcode = new PaynowQR({
    uen: "200714008NWEB",
    amount: props.invoiceData.totalPayable.toFixed(2),
    editable: false,
    expiry: expiryTime.value.format("YYYYMMDDHHmmss"),
    refNumber: `${props.invoiceData.presaleId}`,
    company: "ARK SPORTS MANAGEMENT PTE LTD",
  });

  let QRString = qrcode.output();
  return QRString ? QRString : null;
})
</script>

<template>
  <div class="bookingFormQRPayNow">
    <h1>PayNow Scan & Pay</h1>
    <div class="details">
      <div class="details__row">
        <span>Amount Payable</span>
        <b>${{ invoiceData.totalPayable.toFixed(2) }}</b>
      </div>

      <div class="details__row">
        <span>Payment Within</span>
        <div class="right"><b>10 minutes</b><br />Due on {{ expiryTime.format('DD MMM YYYY HH:MM') }}</div>
      </div>
    </div>

    <VueQR class="qrcode" width="300" logoSrc="/Images/PayNow.png" :text="qrcode" colorDark="#7C1A78" :logoScale="0.23"
      :logoMargin="1.5" :logoCornerRadius="0.1" />
    <QRPayNowInstructions />
  </div>
</template>

<style lang="scss" scoped>
.bookingFormQRPayNow {
  display: grid;
  justify-content: center;
  margin: $margin auto;
  max-width: 600px;
  padding: $margin;
  grid-gap: $p-margin;

  h1 {
    text-align: center;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: $unit;

    &__row {
      display: flex;
      justify-content: space-between;
      border-bottom: $border;
      padding: $unit;

      .right {
        text-align: right;
      }
    }

    span {
      font-size: 1rem;
      font-weight: 400;
    }
  }

  .qrcode {
    justify-self: center;
  }
}
</style>