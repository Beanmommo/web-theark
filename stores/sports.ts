import type { Sport } from "~/types/sport";
import type { SportType } from "~/types/data";

export const useSportsStore = defineStore("sport", () => {
  const sports = ref<Sport[]>([]);
  const isLoaded = ref(false);

  /**
   * Fetch sports from Firebase config
   * Loads ALL active sports (regardless of publish date)
   * Use isBookable() to check if booking is available
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

      // Convert SportType[] to Sport[] - load ALL active sports
      sports.value = sportsTypes
        .filter((sportType: SportType) => {
          // Only filter by active status
          return sportType.active;
        })
        .map((sportType: SportType) => ({
          name: sportType.name,
          slug: sportType.slug,
          icon: sportType.icon,
          theme: sportType.theme,
          backgroundImage: sportType.backgroundImage,
          tag: sportType.tag,
          startingRate: sportType.startingRate,
          websitePublishDate: sportType.websitePublishDate, // When sport page goes live
          bookingPublishDate: sportType.bookingPublishDate, // When booking becomes available
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

  /**
   * Check if a sport page is accessible (websitePublishDate has passed)
   * Used for homepage "Book Now" button - determines if user can navigate to sport page
   * @param sport - The sport to check
   * @returns true if sport page is accessible, false if coming soon
   */
  const isBookable = (sport: Sport): boolean => {
    if (!sport.websitePublishDate) return true; // No date = always accessible

    const publishDate = new Date(sport.websitePublishDate);
    const now = new Date();
    return publishDate <= now;
  };

  /**
   * Check if a sport is coming soon (websitePublishDate is in the future)
   * @param sport - The sport to check
   * @returns true if coming soon, false if page is accessible
   */
  const isComingSoon = (sport: Sport): boolean => {
    return !isBookable(sport);
  };

  // Computed: Only bookable sports (for homepage display)
  const bookableSports = computed(() => {
    return sports.value.filter(isBookable);
  });

  // Computed: Only coming soon sports
  const comingSoonSports = computed(() => {
    return sports.value.filter(isComingSoon);
  });

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
    bookableSports,
    comingSoonSports,
    setActiveSportBySlug,
    getSportPitches,
    getSportByName,
    getSportBySlug,
    getSportVenues,
    isBookable,
    isComingSoon,
  };
});
