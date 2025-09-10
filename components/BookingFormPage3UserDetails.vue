<script setup lang="ts">
import { usePresalesStore } from '~/stores/presales';

const emit = defineEmits(['update:modelValue'])
const user = useAuthUser()
const presalesStore = usePresalesStore()
const auth = useAuth()
const phoneNumber = ref('')
const displayName = ref('')
const loading = ref(false)
const updateError = ref(false)
const errorMessage = ref('')

type FetchError = { data: { message: string } }

onMounted(() =>
{
  if (user.value?.displayName) displayName.value = user.value.displayName
  if (user.value?.phoneNumber) phoneNumber.value = user.value.phoneNumber.slice(3)
})

const fullDetails = computed(() =>
{
  return user.value?.displayName && user.value?.phoneNumber
})

async function clickHandler()
{
  const re = /^(6|8|9)\d{7}$/;
  updateError.value = false

  if (phoneNumber.value && re.test(phoneNumber.value) && displayName.value)
  {
    loading.value = true
    const finalNumber = '+65' + phoneNumber.value
    presalesStore.updateCustomerData({ contact: finalNumber, name: displayName.value })
    if (!user.value?.uid) return;
    const error = await auth.updateUser(user.value?.uid, { phoneNumber: finalNumber, displayName: displayName.value })
    if (error)
    {
      updateError.value = true
      if ((error as FetchError).data.message === 'auth/phone-number-already-exists')
        errorMessage.value = 'Phone number already exists'
      else
        alert((error as FetchError).data.message)
    }
    loading.value = false
  }
}
</script>

<template>
  <div class="bookingFormPage3UserDetails">
    <Loading message='Updating User Details' v-if="loading" />
    <h5>User Details</h5>
    <div class="details">
      <div class="email">Email : {{ user?.email }}</div>
      <div>
        <template v-if="!user?.displayName">
          <div class="number">Name</div>
          <v-text-field density="compact" placeholder="Name" variant="solo" v-model="displayName" />
        </template>
        <div class="name" v-else>Name : {{ user?.displayName }}</div>
      </div>
      <div>
        <template v-if="!user?.phoneNumber">
          <div class="number">Mobile Number</div>
          <v-text-field density="compact" placeholder="Mobile" variant="solo" v-model="phoneNumber" />
        </template>
        <div class="number" v-else>Mobile : {{ user?.phoneNumber }}</div>
      </div>
      <v-alert v-model="updateError" type="error" variant='tonal'>{{ errorMessage }}</v-alert>
      <Button @click="clickHandler" v-if="!fullDetails">Update</Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bookingFormPage3UserDetails {
  display: grid;
  max-width: $main-max;
  grid-gap: $margin;
}

.details {
  display: grid;
  grid-gap: $margin;
  background: rgb(197, 255, 235);
  border-width: 3px;
  border-style: solid;
  border-color: rgb(0, 75, 40);
  padding: $margin;
}

.name {
  font-weight: bold;
}

.email {
  font-weight: bold;
}

.number {
  font-weight: bold;
}
</style>