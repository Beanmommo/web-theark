<script setup lang="ts">
const creditsStore = useCreditsStore()
const { totalCreditsLeft, purchasedCreditsLeft, refundCreditsLeft } = storeToRefs(creditsStore)
</script>

<template>
  <PaymentMethod>
    <v-radio value="Credit" color="accent">
      <template v-slot:label>
        <div class="membership-credit-label">
          <div class="main-label">
            <v-icon class="mr-2">mdi-wallet</v-icon>
            <span>Membership Credit</span>
          </div>
          <div class="credit-breakdown">
            <span class="total">${{ totalCreditsLeft }} available</span>
            <span v-if="refundCreditsLeft > 0" class="refund-notice">
              (includes ${{ refundCreditsLeft }} refund credits - expires in 1 month, used first)
            </span>
          </div>
        </div>
      </template>
    </v-radio>
  </PaymentMethod>
</template>

<style lang="scss" scoped>
.membership-credit-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .main-label {
    display: flex;
    align-items: center;
  }

  .credit-breakdown {
    display: flex;
    flex-direction: column;
    font-size: 0.875rem;
    margin-left: 2rem;

    .total {
      font-weight: 600;
      color: #0A8A44;
    }

    .refund-notice {
      color: #FF9800;
      font-size: 0.75rem;
      font-style: italic;
    }
  }
}
</style>
