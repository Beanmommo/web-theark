import type { Sport } from "~/types/sport";

export const useSportsStore = defineStore("sport", () => {
  const sports = ref<Sport[]>([
    {
      name: "Futsal",
      slug: "futsal",
      icon: "mdi-soccer",
      startingRate: 60,
      tag: "Indoor & Outdoor",
      theme: {
        dark: false,
        colors: {
          primary: "#000",
          secondary: "#b0bec5",
          accent: "#0A8A44",
          error: "#b71c1c",
        },
      },
    },
    {
      name: "Pickleball",
      slug: "pickleball",
      icon: "mdi-tennis",
      startingRate: 25,
      tag: "Indoor",
      theme: {
        dark: false,
        colors: {
          primary: "#000",
          secondary: "#b0bec5",
          accent: "#5A9AD2",
          error: "#b71c1c",
        },
      },
    },
  ]);
  return { sports };
});
