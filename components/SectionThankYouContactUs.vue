<template>
  <SectionContainer>
    <div class="sectionThankYou">
      <p>Thank you for contacting us. Our staff will get in touch with you within the next working day.</p>
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
  text-align: center;

  p {
    font-weight: 600;
  }

  >.button {
    height: 50px;
  }
}
</style>