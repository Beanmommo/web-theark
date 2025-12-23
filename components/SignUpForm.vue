<script setup lang="ts">
import { useTheme } from "vuetify";

const emit = defineEmits(["success", "change"]);
const { signUpWithGoogle } = useAuth();
const loading = ref(false);

function successHandler() {
  emit("success");
}

async function clickHandlerGoogle() {
  loading.value = true;
  await signUpWithGoogle();
  loading.value = false;
}

async function clickHandlerLogIn() {
  emit("change");
}

const theme = useTheme();
const accentColor = computed(() => {
  return theme.current.value.colors.accent;
});
</script>

<template>
  <div class="signUpForm" :style="{ color: accentColor }">
    <Loading v-if="loading" />
    <h2>Sign Up</h2>
    <SignUpFormEmail @success="successHandler" />
    <div class="alt__signin">
      <div class="separator">Or Sign Up with</div>
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
      Already have an account?
      <span
        class="accent"
        :style="{ color: accentColor }"
        @click.prevent="clickHandlerLogIn"
        >Log In</span
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.signUpForm {
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
  cursor: pointer;
  text-decoration: underline;
}
</style>
