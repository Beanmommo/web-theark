import VueQR from 'vue-qr/src/packages/vue-qr.vue'

export default defineNuxtPlugin(app =>
{
  app.vueApp.component('VueQR', VueQR)

});