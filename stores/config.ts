import { defineStore } from "pinia";
import { type Config, type Pitch, type SportType } from "../types/data";

export const useConfigStore = defineStore("config", () => {
  const config = ref<Config>();
  const showPopup = ref(false);

  const fetchConfig = async (): Promise<Config | undefined> => {
    const { data } = await useFetch("/api/config");
    if (!data.value) {
      console.warn("No config data received from API");
      return config.value;
    }

    config.value = data.value as Config;

    // Safely check if popup exists and is an array
    if (config.value?.popup && Array.isArray(config.value.popup)) {
      showPopup.value = config.value.popup.some((item) => item.popup) ?? false;
    } else {
      showPopup.value = false;
    }

    return config.value;
  };

  const closePopup = () => {
    showPopup.value = false;
  };

  const getSportTypes = (): SportType[] => {
    return config.value?.sportsTypes ?? [];
  };

  /**
   * Get sport terminology by sport slug (lowercase name)
   * @param sportSlug - The sport slug (e.g., "futsal", "pickleball", null for legacy)
   * @param type - 'singular' or 'plural'
   * @returns The terminology string capitalized (e.g., "Pitch", "Court")
   */
  const getSportTerminology = (
    sportSlug: string | null | undefined,
    type: "singular" | "plural" = "singular"
  ): string => {
    // Handle null/undefined typeOfSports (legacy futsal pitches)
    // If typeOfSports is null or undefined, default to "futsal"
    const slug = sportSlug?.toLowerCase() || "futsal";

    // Find sport type in config by comparing lowercase name
    const sportType = config.value?.sportsTypes?.find((st: SportType) => {
      const match = st.name.toLowerCase() === slug;
      return match;
    });

    // Return terminology (capitalize first letter) or fallback to "Pitch"/"Pitches"
    if (sportType?.terminology) {
      const term = sportType.terminology[type];
      // Capitalize first letter
      const capitalized = term.charAt(0).toUpperCase() + term.slice(1);
      return capitalized;
    }

    // Fallback
    return type === "singular" ? "Pitch" : "Pitches";
  };

  /**
   * Get terminology for a Pitch object
   * @param pitch - The Pitch object
   * @param type - 'singular' or 'plural'
   * @returns The terminology string capitalized (e.g., "Pitch", "Court")
   */
  const getPitchTerminology = (
    pitch: Pitch,
    type: "singular" | "plural" = "singular"
  ): string => {
    return getSportTerminology(pitch.typeOfSports, type);
  };

  return {
    config,
    showPopup,
    fetchConfig,
    closePopup,
    getSportTypes,
    getSportTerminology,
    getPitchTerminology,
  };
});
