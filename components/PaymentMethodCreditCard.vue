<template>
  <PaymentMethod>
    <v-radio value="Credit Card" color="accent">
      <template v-slot:label>
        <v-icon class="mr-2">mdi-credit-card</v-icon>
        <span class="label">Credit Card (5% fee)</span>
      </template>
    </v-radio>
  </PaymentMethod>
</template>
