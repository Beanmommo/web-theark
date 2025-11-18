<script setup lang="ts">
import { useReCaptcha } from "vue-recaptcha-v3";

type Contact = {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  message: string;
};

const formRef = ref();
const contact = ref({} as Contact);
const loading = ref(false);
const recaptchaReady = ref(false);

// Wait for reCAPTCHA to be ready
onMounted(async () => {
  try {
    const captcha = useReCaptcha();
    if (captcha) {
      const { recaptchaLoaded } = captcha;
      await recaptchaLoaded();
      recaptchaReady.value = true;
    }
  } catch (error) {
    console.error("Failed to load reCAPTCHA:", error);
  }
});

async function submitHandler() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;

  // Check if reCAPTCHA is ready
  if (!recaptchaReady.value) {
    alert("reCAPTCHA is still loading. Please try again in a moment.");
    loading.value = false;
    return;
  }

  // Check Recaptcha
  try {
    const captcha = useReCaptcha();
    if (!captcha) {
      throw new Error("reCAPTCHA not loaded");
    }
    const { executeRecaptcha } = captcha;

    // Execute reCAPTCHA to get the token
    const token = await executeRecaptcha("submit_form");

    // Send the token to the server for verification
    const response = await $fetch<{
      success: boolean;
      score?: number;
      "error-codes"?: string[];
    }>("/api/recaptcha", {
      method: "POST",
      body: { token },
    });

    if (!response.success) {
      const error =
        response["error-codes"]?.join(", ") || "Failed reCAPTCHA verification";
      alert(error);
      loading.value = false;
      return;
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    alert("Error verifying reCAPTCHA.");
    loading.value = false;
    return;
  }

  await $fetch("/api/contactUs", {
    method: "post",
    body: contact.value,
  });
  loading.value = false;
  navigateTo("/contactus/thankyou");
}
</script>

<template>
  <div>
    <Loading v-if="loading" message="Submitting Form"></Loading>
    <v-form ref="formRef" lazy-validation>
      <v-text-field
        color="black"
        outlined
        name="First Name"
        label="First Name"
        v-model="contact.firstName"
        :rules="[(v) => !!v || 'First Name is required']"
      ></v-text-field>
      <v-text-field
        color="black"
        outlined
        name="Last Name"
        label="Last Name"
        v-model="contact.lastName"
        :rules="[(v) => !!v || 'Last Name is required']"
      ></v-text-field>
      <v-text-field
        color="black"
        outlined
        name="Email"
        label="Email"
        v-model="contact.email"
        :rules="[(v) => !!v || 'Email is required']"
      ></v-text-field>
      <v-text-field
        color="black"
        outlined
        name="Contact"
        label="Contact Number"
        v-model="contact.contact"
      ></v-text-field>
      <v-textarea
        color="black"
        outlined
        name="Message"
        label="Message"
        v-model="contact.message"
        :rules="[(v) => !!v || 'Message is required']"
      ></v-textarea>
      <v-btn
        rounded
        block
        color="accent"
        class="white--text the-ark-nav-btn mb-16"
        @click.prevent="submitHandler"
        aria-label="Send"
        >Send</v-btn
      >
    </v-form>
  </div>
</template>
