<template>
  <PaymentMethod>

    <v-radio value="PayNow" color="accent">
      <template v-slot:label>
        <div class="image">
          <img src="/Images/PayNow.png" alt="PayNow" />
        </div>
      </template>
    </v-radio>

  </PaymentMethod>
</template>

<style lang="scss" scoped>
.image {
  display: flex;
  align-items: center;
  width: 80px;
}

img {
  width: 100%;
}
</style>

<style>
.v-label {
  opacity: 1;
}
</style>