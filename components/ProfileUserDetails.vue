<script setup lang="ts">

const creditsStore = useCreditsStore()
const { totalCreditsLeft, purchasedCreditsLeft, refundCreditsLeft } = storeToRefs(creditsStore)
const user = useAuthUser()
const router = useRouter()

function clickHandler() {
  router.push('/packages')
}

</script>
<template>
  <div class="profileUserDetails">
    <img src="/Icon/user_profile.svg" alt="User Profile" class="icon" />
    <div class="profile__details">
      <h3>{{ user?.displayName }}</h3>
      <p>{{ user?.phoneNumber }}</p>
      <p>{{ user?.email }}</p>
    </div>
    <div class="profile__credits">
      <h6>Total Credits</h6>
      <h5>${{ totalCreditsLeft }}</h5>

      <!-- Credits Breakdown -->
      <div class="credits-breakdown">
        <div class="credit-row">
          <VIcon icon="mdi-cash-multiple" size="small" color="green" />
          <span class="credit-label">Purchased:</span>
          <span class="credit-amount">${{ purchasedCreditsLeft }}</span>
        </div>
        <div class="credit-row">
          <VIcon icon="mdi-cash-refund" size="small" color="orange" />
          <span class="credit-label">Refund:</span>
          <span class="credit-amount">${{ refundCreditsLeft }}</span>
        </div>
      </div>

      <ButtonOutlined @click=clickHandler>Buy Package</ButtonOutlined>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profileUserDetails {
  display: grid;
  align-items: center;
  grid-template-columns: 15% 15% 1fr;
  box-shadow: $box-shadow;
  padding: $p-margin;

  .icon {
    width: 4rem;
    height: 4rem;
  }
}

.profile {
  &__credits {
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: $unit;
    align-items: flex-end;
    justify-self: self-end;

    .credits-breakdown {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      font-size: 0.875rem;

      .credit-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .credit-label {
          flex: 1;
          color: rgba(0, 0, 0, 0.6);
        }

        .credit-amount {
          font-weight: 600;
          color: rgba(0, 0, 0, 0.87);
        }
      }
    }
  }
}
</style>
