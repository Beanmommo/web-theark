<script setup lang="ts">
import { ref } from 'vue'

const valid = ref(false)
const form = ref<HTMLFormElement>()
const loading = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmedPassword = ref('')
const mobile = ref('')
const loginError = ref(false)


const emit = defineEmits(['success'])

const { signUpNewUser } = useAuth()

const signUp = async () =>
{
  loading.value = true
  try
  {
    await signUpNewUser(name.value, `+65${mobile.value}`, email.value, password.value)
    emit('success')
  } catch (error)
  {
    loginError.value = true
    password.value = ''
  } finally
  {
    loading.value = false
  }
}

async function clickHandlerSignUp()
{
  if (form.value)
  {
    const { valid } = await form.value.validate()
    if (valid)
      signUp()
  }
}


</script>

<template>
  <div class="signInFormEmail">
    <Loading message="Submitting Credentials" v-if="loading" />
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field variant="outlined" name="Name" label="Name" v-model="name"
        :rules="[v => !!v || 'Name is required']"></v-text-field>
      <v-text-field variant="outlined" name="Mobile" label="Mobile" v-model="mobile"
        :rules="[v => !!v || 'Mobile is required']" prefix="+65"></v-text-field>
      <v-text-field variant="outlined" name="Email" label="Email" v-model="email"
        :rules="[v => !!v || 'Email is required']"></v-text-field>
      <v-text-field variant="outlined" color="black" name="Password" label="Password" type="password" v-model="password"
        :rules="[v => !!v || 'Password is required']"></v-text-field>
      <v-text-field variant="outlined" color="black" name="ConfirmedPassword" label="Confirm Password" type="password"
        v-model="confirmedPassword" :rules="[v => (v === password) || 'Password and Confirm Password do not match']"
        @keydown.enter="clickHandlerSignUp"></v-text-field>
      <v-alert v-model="loginError" type="error" variant='tonal'>Incorrect Username or Password. Please try
        again.</v-alert>
      <div class="buttons">
        <Button @click.prevent="clickHandlerSignUp" type="submit">Sign Up</Button>
      </div>

    </v-form>
  </div>
</template>

<style lang="scss" scoped>
.signInFormEmail {
  width: 100%;
}

.buttons {
  display: grid;
  grid-template-columns: 1fr;
}
</style>

<style>
.v-label {
  color: rgb(72, 72, 72) !important;
  font-weight: 300 !important;
}
</style>