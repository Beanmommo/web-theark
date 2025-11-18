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
    if (sport) {
      activeSportSlug.value = sport.slug;
    }
  };

  const getSportByName = (sportName: string) => {
    return sports.value.find((sport) => sport.name === sportName);
  };

  const getSportBySlug = (slug: string) => {
    return sports.value.find((sport) => sport.slug === slug);
  };

  const getSportPitches = (sportSlug: string | null | undefined) => {
    if (!sportSlug) return []
    const lowerCaseSlug = sportSlug.toLowerCase()
    const pitchesStore = usePitchesStore();
    // Filter pitches by sport type AND active status
    return pitchesStore.pitches.filter(
      (pitch) =>
      pitch.active && // Only include active pitches
      ((pitch.typeOfSports === null && lowerCaseSlug === "futsal") ||
      (pitch.typeOfSports && pitch.typeOfSports.toLowerCase() === lowerCaseSlug))
    );
  };

  // Get venues for a specific sport
  // This filters locations based on which pitches are available for the sport
  // Only includes venues that have at least one active pitch for the sport
  const getSportVenues = (sportSlug: string | null | undefined) => {
    if (!sportSlug) return []
    const lowerCaseSlug = sportSlug.toLowerCase()
    const locationsStore = useLocationsStore();
    const pitchesStore = usePitchesStore();

    // Filter pitches by sport type AND active status
    const sportPitches = pitchesStore.pitches.filter(
      (pitch) =>
      pitch.active && // Only include active pitches
      ((pitch.typeOfSports === null && lowerCaseSlug === "futsal") ||
      (pitch.typeOfSports && pitch.typeOfSports.toLowerCase() === lowerCaseSlug))
    );

    // Get unique location keys from those pitches
    const uniqueVenueKeys = Array.from(
      new Set(sportPitches.map((pitch) => pitch.locationKey))
    );

    // Return locations that have pitches for this sport
    return locationsStore.locations.filter((location) =>
      uniqueVenueKeys.includes(location.key)
    );
  };

  // Computed property for active sport venues
  const activeSportVenues = computed(() => {
    if (!activeSport.value) return [];
    return getSportVenues(activeSport.value.slug);
  });

  return {
    sports,
    activeSport,
    activeSportVenues,
    setActiveSportBySlug,
    getSportPitches,
    getSportByName,
    getSportBySlug,
    getSportVenues,
  };
});
