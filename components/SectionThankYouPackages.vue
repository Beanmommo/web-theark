<script setup lang="ts">
const router = useRouter()
function clickHandler()
{
  router.push('/profile')
}
</script>

<template>
  <SectionContainer>
    <div class="sectionThankYouPackages">
      <h4>Thank you for your package purchase at The ARK.</h4>
      <p>Your purchase has been successfully submitted. We will send you an email with the invoice shortly.</p>
      <Button class="button" @click="clickHandler">View Credits Available</Button>
    </div>
  </SectionContainer>
</template>

<style lang="scss" scoped>
.sectionThankYouPackages {
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