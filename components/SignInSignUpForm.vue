<script setup lang="ts">

const emit = defineEmits(['success'])

enum FormType
{
  SignIn = 'SignIn',
  SignUp = 'SignUp',
}
const formType = ref(FormType.SignIn)

function successHandler()
{
  emit('success')
}

function changeHandler()
{
  formType.value = formType.value === FormType.SignIn ? FormType.SignUp : FormType.SignIn
}
</script>

<template>
  <div class="signInSignUpForm">
    <SignInForm @success="successHandler" @change="changeHandler" v-if="formType === FormType.SignIn" />
    <SignUpForm @success="successHandler" @change="changeHandler" v-else />
  </div>
</template>

<style lang="scss" scoped>
$max-form-width: 400px;

.signInSignUpForm {
  max-width: $max-form-width;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>