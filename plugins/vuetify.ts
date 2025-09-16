import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";

const thearkTheme = {
  dark: false,
  colors: {
    primary: "#000",
    secondary: "#b0bec5",
    accent: "#110647",
    error: "#b71c1c",
  },
};

// green theme
const futsalTheme = {
  dark: false,
  colors: {
    primary: "#000",
    secondary: "#b0bec5",
    accent: "#0A8A44",
    error: "#b71c1c",
  },
};

// blue theme
const pickleBallTheme = {
  dark: false,
  colors: {
    primary: "#000",
    secondary: "#b0bec5",
    accent: "#5A9AD2",
    error: "#b71c1c",
  },
};

export type VuetifyTheme = "thearkTheme" | "futsalTheme" | "pickleBallTheme";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: "mdi",
    },
    theme: {
      defaultTheme: "thearkTheme",
      themes: {
        thearkTheme,
        futsalTheme,
        pickleBallTheme,
      },
    },
  });
  app.vueApp.use(vuetify);
});
