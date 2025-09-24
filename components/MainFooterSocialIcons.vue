<script setup lang="ts">
import { useTheme } from 'vuetify';

const theme = useTheme()
</script>

<template>
  <div class="mainFooterSocialIcons">
    <h4>GST Registration Number : 200714008N</h4>
    <h3>Follow us :</h3>
    <div class="icons_container">
      <a href="https://www.facebook.com/Thearksg/" target="_blank">
        <img src="/Icon/footer_fb_icon.svg" alt="Facebook Icon" />
      </a>
      <a href="https://www.instagram.com/thearkfutsal/" target="_blank">
        <img src="/Icon/footer_instagram_icon.svg" alt="Instagram Icon" /></a>
      <a href="tel:+6591852555" target="_blank">
        <img src="/Icon/footer_phone_icon.svg" alt="Phone Icon" /></a>
      <a href="https://wa.me/6591852555" target="_blank">
        <img src="/Icon/footer_whatsapp_icon.svg" alt="Whatsapp Icon" /></a>
    </div>
    <div class="link" @click="$router.push('/content/terms')">Terms and Conditions</div>
    <div class="copyright" :style="{ color: accentColor }">Copyright 2020 © The Ark Futsal</div>
  </div>
</template>

<style lang="scss" scoped>
.mainFooterSocialIcons {
  display: grid;
  justify-items: center;
  color: $functional-white;
  grid-gap: $margin;

  h3 {
    font-weight: 900;
  }
}

.icons_container {
  display: flex;
  gap: $margin;
  justify-items: center;
  align-items: center;

  >img {
    width: 30px;

    @include md {
      width: 100%;
    }
  }
}

.link {
  color: $functional-white;
  font-weight: 600;
  cursor: pointer;
}

.copyright {
  color: $functional-white;

}
</style>