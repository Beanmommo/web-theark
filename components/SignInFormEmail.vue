<script setup lang="ts">
import { ref } from 'vue'

const valid = ref(false)
const loading = ref(false)
const email = ref('')
const password = ref('' as string | null)
const loginError = ref(false)


const emit = defineEmits(['success'])

const { loginWithEmail } = useAuth()

const signIn = async () =>
{
  loading.value = true
  try
  {
    if (!password.value) return;
    await loginWithEmail(email.value, password.value)
  } catch (error)
  {
    loginError.value = true
    password.value = null
  } finally
  {
    loading.value = false
  }
}

function clickHandlerSignIn()
{
  console.log(valid.value)
  if (valid.value)
    signIn()
}

function clickHandlerForgotPassword()
{

}


</script>

<template>
  <div class="signInFormEmail">
    <Loading message="Submitting Credentials" v-if="loading" />
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field variant="outlined" name="Email" label="Email" v-model="email"
        :rules="[v => !!v || 'Email is required']"></v-text-field>
      <v-text-field variant="outlined" color="black" name="Password" label="Password" type="password" v-model="password"
        :rules="[v => !!v || 'Password is required']" @keydown.enter="clickHandlerSignIn"></v-text-field>
      <v-alert v-model="loginError" type="error" variant='tonal'>Incorrect Username or Password. Please try
        again.</v-alert>
      <div class="buttons">
        <v-btn color="accent" variant="text" @click="clickHandlerForgotPassword">Forgot Password?</v-btn>
        <Button @click.prevent="clickHandlerSignIn">Sign In</Button>
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
  justify-content: center;
}
</style>

<style>
.v-label {
  color: rgb(72, 72, 72) !important;
  font-weight: 300 !important;
}
</style>