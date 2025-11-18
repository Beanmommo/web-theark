<script setup lang="ts">
import { useReCaptchaHandler } from "~/composables/useRecaptchaHandler";

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
const { verifyRecaptcha } = useReCaptchaHandler();

async function submitHandler() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;

  // Check Recaptcha
  const recaptchaResult = await verifyRecaptcha("submit_form");
  if (!recaptchaResult.success) {
    alert(recaptchaResult.error);
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
