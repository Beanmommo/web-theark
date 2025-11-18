export default defineNuxtPlugin(() => {
  // Load reCAPTCHA script once for the entire app
  useRecaptchaProvider();
});

