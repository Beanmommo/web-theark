import type { Sport } from "~/types/sport";

export const useSportsStore = defineStore("sport", () => {
  const sports = ref<Sport[]>([
    {
      name: "Futsal",
      slug: "futsal",
      icon: "mdi-soccer",
      startingRate: 60,
      tag: "Indoor & Outdoor",
      theme: "futsalTheme",
      backgroundImage:
        "https://res.cloudinary.com/thearksg/image/upload/f_auto/v1594089843/website/landingpage_image_slide1.png",
    },
    {
      name: "Pickleball",
      slug: "pickleball",
      icon: "mdi-tennis",
      startingRate: 25,
      tag: "Indoor",
      theme: "pickleBallTheme",
      backgroundImage:
        "https://github.com/Beanmommo/web-theark/blob/main/public/Images/pickleball_background.png?raw=true",
    },
  ]);

  const activeSportSlug = ref<string>("");
  const activeSport = computed(() => {
    return sports.value.find((sport) => sport.slug === activeSportSlug.value);
  });

  const setActiveSportBySlug = (slug: string) => {
    const sport = sports.value.find((sport) => sport.slug === slug);
  };

  const getSportByName = (sportName: string) => {
    return sports.value.find((sport) => sport.name === sportName);
  };

  const getSportBySlug = (slug: string) => {
    return sports.value.find((sport) => sport.slug === slug);
  };

  return {
    sports,
    activeSport,
    setActiveSportBySlug,
    getSportByName,
    getSportBySlug,
  };
});
