<script setup lang="ts">
const router = useRouter()
function clickHandler()
{
  router.push('/profile')
}
</script>

<template>
  <SectionContainer>
    <div class="sectionThankYou">
      <h4>Thank you for booking at The ARK.</h4>
      <p>Your booking has been successfully submitted. We will send you an email with the invoice shortly.</p>
      <Button class="button" @click="clickHandler">View Bookings</Button>
    </div>
  </SectionContainer>
</template>

<style lang="scss" scoped>
.sectionThankYou {
  display: grid;
  margin: $margin auto;
  max-width: $main-max;
  padding: $margin;
  justify-items: center;
  align-items: center;
  border: 1px solid black;
  height: 200px;
  text-align: center;

  h4 {
    font-weight: 600;
  }

  >.button {
    height: 50px;
  }
}
</style>