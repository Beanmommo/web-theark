<script setup lang="ts">
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

// Initialize reCAPTCHA v3 - must be called in setup
const { execute } = useChallengeV3("submit_form");

async function submitHandler() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;

  try {
    // Execute reCAPTCHA to get token
    const token = await execute();

    // Verify token on server
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

    // Submit the form
    await $fetch("/api/contactUs", {
      method: "post",
      body: contact.value,
    });
    loading.value = false;
    navigateTo("/contactus/thankyou");
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    alert("Error verifying reCAPTCHA. Please try again.");
    loading.value = false;
  }
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
