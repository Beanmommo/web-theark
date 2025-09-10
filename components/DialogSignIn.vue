<template>
  <v-dialog width="300">
    <template v-slot:activator="{ props }">
      <div v-bind="props">
        <slot />
      </div>
    </template>

    <template v-slot:default="{ isActive }">
      <div class="dialog__container">
        <div class="dialog__container__close">
          <v-icon @click="isActive.value = false">mdi-close</v-icon>
        </div>
        <SignInSignUpForm />
      </div>
    </template>
  </v-dialog>
</template>

<style lang="scss" scoped>
.dialog__container {
  background: white;
  padding: $margin;
  box-shadow: $box-shadow;
}

.dialog__container__close {
  display: flex;
  justify-content: flex-end;
}
</style>