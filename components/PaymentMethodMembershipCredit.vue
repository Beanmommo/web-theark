<template>
  <PaymentMethod>
    <v-radio value="Credit" color="accent">
      <template v-slot:label>
        <v-icon class="mr-2">mdi-wallet</v-icon>
        <span>
          Membership Credit
        </span>
      </template>
    </v-radio>
  </PaymentMethod>
</template>
