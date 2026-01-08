import type { Sport } from "~/types/sport";
import type { SportType } from "~/types/data";

export const useSportsStore = defineStore("sport", () => {
  const sports = ref<Sport[]>([]);
  const isLoaded = ref(false);

  /**
   * Fetch sports from Firebase config
   * Filters based on websitePublishDate to show only live sports
   */
  const fetchSports = async (): Promise<Sport[]> => {
    try {
      const configStore = useConfigStore();

      // Ensure config is loaded
      if (!configStore.config) {
        await configStore.fetchConfig();
      }

      const sportsTypes = configStore.getSportTypes();

      if (!sportsTypes || sportsTypes.length === 0) {
        console.warn("No sports types found in config");
        isLoaded.value = true;
        return sports.value;
      }

      const now = new Date();

      // Convert SportType[] to Sport[] and filter by publish dates
      sports.value = sportsTypes
        .filter((sportType: SportType) => {
          // Must be active
          if (!sportType.active) return false;

          // If websitePublishDate is set, check if it's in the past
          if (sportType.websitePublishDate) {
            const publishDate = new Date(sportType.websitePublishDate);
            if (publishDate > now) return false; // Not yet published
          }

          return true;
        })
        .map((sportType: SportType) => ({
          name: sportType.name,
          slug: sportType.slug,
          icon: sportType.icon,
          theme: sportType.theme,
          backgroundImage: sportType.backgroundImage,
          tag: sportType.tag,
          startingRate: sportType.startingRate,
        }));

      isLoaded.value = true;
      return sports.value;
    } catch (error) {
      console.error("Error fetching sports:", error);
      isLoaded.value = true;
      return sports.value;
    }
  };

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

  // Helper function to check if a pitch matches the sport type
  // Handles legacy pitches where typeOfSports is null (defaults to futsal)
  const isPitchForSport = (pitch: any, sportSlug: string) => {
    const lowerCaseSlug = sportSlug.toLowerCase();
    return (
      (pitch.typeOfSports === null && lowerCaseSlug === "futsal") ||
      (pitch.typeOfSports && pitch.typeOfSports.toLowerCase() === lowerCaseSlug)
    );
  };

  // Helper function to filter pitches by sport and active status
  // activeCheck: function that determines if a pitch is active (different for website vs backend)
  const filterPitchesBySport = (
    sportSlug: string,
    activeCheck: (pitch: any) => boolean
  ) => {
    const pitchesStore = usePitchesStore();
    const { pitches } = storeToRefs(pitchesStore);
    return pitches.value.filter(
      (pitch) => activeCheck(pitch) && isPitchForSport(pitch, sportSlug)
    );
  };

  const getSportPitches = (sportSlug: string | null | undefined) => {
    if (!sportSlug) return [];
    // Filter pitches by sport type AND active status (website active)
    return filterPitchesBySport(
      sportSlug,
      (pitch) => pitch.active || pitch.backendActive
    );
  };

  // Get venues for a specific sport
  // This filters locations based on which pitches are available for the sport
  // Only includes venues that have at least one active pitch for the sport
  const getSportVenues = (sportSlug: string | null | undefined) => {
    if (!sportSlug) return [];
    const locationsStore = useLocationsStore();
    const { locations } = storeToRefs(locationsStore);
    // Filter pitches by sport type AND active status (backend active)
    const sportPitches = filterPitchesBySport(
      sportSlug,
      (pitch) => pitch.active || pitch.backendActive
    );
    // Get unique location keys from those pitches
    const uniqueVenueKeys = Array.from(
      new Set(sportPitches.map((pitch) => pitch.locationKey))
    );

    // Return locations that have pitches for this sport
    return locations.value.filter((location) =>
      uniqueVenueKeys.includes(location.key)
    );
  };

  // Computed property for active sport venues
  const activeSportVenues = computed(() => {
    if (!activeSport.value) return [];
    return getSportVenues(activeSport.value.slug);
  });

  // Computed property for active sport pitches
  const activeSportPitches = computed(() => {
    if (!activeSport.value) return [];
    return getSportPitches(activeSport.value.slug);
  });

  return {
    sports,
    isLoaded,
    fetchSports,
    activeSport,
    activeSportVenues,
    activeSportPitches,
    setActiveSportBySlug,
    getSportPitches,
    getSportByName,
    getSportBySlug,
    getSportVenues,
  };
});
