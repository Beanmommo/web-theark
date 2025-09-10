import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const lightTheme = {
  dark: false,
  colors: {
    primary: "#000",
    secondary: "#b0bec5",
    accent: "#0A8A44",
    error: "#b71c1c",
  },
}

export default defineNuxtPlugin((app) =>
{
  const vuetify = createVuetify({
    icons: {
      defaultSet: 'mdi',
    },
    theme: {
      defaultTheme: 'lightTheme',
      themes: {
        lightTheme,
      }
    },
  })
  app.vueApp.use(vuetify)
})