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
    },
    {
      name: "Pickleball",
      slug: "pickleball",
      icon: "mdi-tennis",
      startingRate: 25,
      tag: "Indoor",
      theme: "pickleBallTheme",
    },
  ]);

  const activeSportName = ref<string>("");
  const activeSport = computed(() => {
    return sports.value.find((sport) => sport.name === activeSportName.value);
  });

  const setActiveSport = (sportName: string) => {
    activeSportName.value = sportName;
  };

  const activeSportTheme = computed(() => {
    return activeSport.value?.theme;
  });

  return { sports, activeSport, setActiveSport, activeSportTheme };
});
