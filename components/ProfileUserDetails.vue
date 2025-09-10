<script setup lang="ts">

const creditsStore = useCreditsStore()
const { totalCreditsLeft } = storeToRefs(creditsStore)
const user = useAuthUser()
const router = useRouter()

function clickHandler()
{
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
      <h6>Credits</h6>
      <h5>${{ totalCreditsLeft }}</h5>
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
    width: 150px;
    display: flex;
    flex-direction: column;
    gap: $unit;
    align-items: flex-end;
    justify-self: self-end;
  }
}
</style>
