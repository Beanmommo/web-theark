<script setup lang="ts">
import { useTheme } from "vuetify";

const emit = defineEmits(["success", "change"]);
const { loginWithGoogle } = useAuth();
const loading = ref(false);
const message = "Signing In";

function successHandler() {
  emit("success");
}

async function clickHandlerGoogle() {
  loading.value = true;
  await loginWithGoogle();
  loading.value = false;
}

async function clickHandlerSignUp() {
  emit("change");
}

const theme = useTheme();
const accentColor = computed(() => {
  return theme.current.value.colors.accent;
});
</script>

<template>
  <div class="signInForm">
    <Loading :message="message" v-if="loading" />
    <h2>Sign In</h2>
    <SignInFormEmail @success="successHandler" />
    <div class="alt__signin">
      <div class="separator">Or login with</div>
      <v-btn
        color="#DB4437"
        block
        @click="clickHandlerGoogle"
        aria-label="Google Sign In"
      >
        <img src="/Icon/button_google.svg" alt="Google" height="20" />Google
      </v-btn>
    </div>

    <div class="signup__option">
      Don't have an account?
      <span
        class="accent"
        :style="{ color: accentColor }"
        @click="clickHandlerSignUp"
        >SIGN UP</span
      >
    </div>
    <!-- <v-alert v-model="loginError" type="error" outlined>Sorry. There is no record of user.</v-alert> -->
  </div>
</template>

<style lang="scss" scoped>
.signInForm {
  display: grid;
  justify-items: center;
  width: 100%;

  h2 {
    font-size: 1.5rem;
    margin-bottom: $margin;
  }
}

.alt__signin {
  display: grid;
  grid-auto-flow: row;
  justify-items: center;
  grid-gap: $margin;
  margin-top: $p-margin;
  width: 100%;
}

.signup__option {
  margin-top: $p-margin;
}

.accent {
  color: $primary-accent;
  cursor: pointer;
  text-decoration: underline;
}
</style>
