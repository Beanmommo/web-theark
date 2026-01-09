import { defineStore } from "pinia";
import { type Config, type Pitch, type SportType } from "../types/data";

export const useConfigStore = defineStore("config", () => {
  const config = ref<Config>();
  const showPopup = ref(false);

  const fetchConfig = async (): Promise<Config | undefined> => {
    try {
      const { data } = await useFetch("/api/config");
      if (!data.value) {
        console.warn("No config data received from API");
        return config.value;
      }

      // Normalize the data structure
      const rawData = data.value as any;

      // Ensure popup is an array
      let popupArray: any[] = [];
      if (rawData.popup) {
        if (Array.isArray(rawData.popup)) {
          popupArray = rawData.popup;
        } else if (typeof rawData.popup === "object") {
          // Convert object to array (in case it's stored as an object in Firebase)
          popupArray = Object.values(rawData.popup);
        }
      }

      // Ensure sportsTypes is an array
      let sportsTypesArray: SportType[] = [];
      if (rawData.sportsTypes) {
        if (Array.isArray(rawData.sportsTypes)) {
          sportsTypesArray = rawData.sportsTypes;
        } else if (typeof rawData.sportsTypes === "object") {
          // Convert object to array (in case it's stored as an object in Firebase)
          sportsTypesArray = Object.values(rawData.sportsTypes);
        }
      }

      config.value = {
        popup: popupArray,
        sportsTypes: sportsTypesArray,
      };

      // Safely check if any popup should be shown
      showPopup.value =
        popupArray.some((item) => item?.popup === true) ?? false;

      return config.value;
    } catch (error) {
      console.error("Error in fetchConfig:", error);
      // Return empty config to prevent crashes
      config.value = {
        popup: [],
        sportsTypes: [],
      };
      return config.value;
    }
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
