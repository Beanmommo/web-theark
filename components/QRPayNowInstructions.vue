<template>
  <div class="qrPayNowInstructions">
    <div class="header">Please follow these instructions</div>
    <div class="instructions">
      <div class="instructions__row">
        <span>1</span>
        <div>Save or screenshot the QR code to make payments using PayNOW supporting apps <b>(except PAYLAH!)</b>.</div>
      </div>
      <div class="instructions__row">
        <span>2</span>
        <div>Make sure the recipient is <b>ARK SPORTS MANAGEMENT PTE LTD</b></div>
      </div>
      <div class="instructions__row">
        <span>3</span>
        <div>If you have successfully made the payment but the page is not automatically redirected, please contact us
          (+65 91852555).
          Thank you.</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.qrPayNowInstructions {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: $margin;
  display: flex;
  flex-direction: column;
  gap: $unit;

  .header {
    font-size: 1.2rem;
    margin-bottom: $unit;
  }

  .instructions {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    padding: $margin;
    display: flex;
    flex-direction: column;
    gap: $margin;

    &__row {
      display: grid;
      grid-template-columns: 2rem 1fr;
      gap: $margin;

      & span {
        background: teal;
        color: white;
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
</style>