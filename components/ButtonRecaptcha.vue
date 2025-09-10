<script setup>
import { useReCaptcha } from 'vue-recaptcha-v3';

const { executeRecaptcha, recaptchaLoaded } = useReCaptcha();

const executeRecaptchaAction = async () =>
{
  try
  {
    // Wait until reCAPTCHA is fully loaded (optional)
    await recaptchaLoaded();

    // Execute reCAPTCHA with action "login"
    const token = await executeRecaptcha('login');

    console.log('reCAPTCHA token:', token);

    // You can now send the token to your backend for verification
    await $fetch('/api/verify-recaptcha', {
      method: 'POST',
      body: { token },
    });
  } catch (error)
  {
    console.error('Error executing reCAPTCHA:', error);
  }
};
</script>

<template>
  <button @click="executeRecaptchaAction">Execute reCAPTCHA</button>
</template>
