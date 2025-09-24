export const useSport = () => {
  const sportsStore = useSportsStore();
  const { activeSport } = storeToRefs(sportsStore);

  const locationsStore = useLocationsStore();
  const { locations } = storeToRefs(locationsStore);

  const pitchesStore = usePitchesStore();
  const { pitches } = storeToRefs(pitchesStore);

  const activeSportVenues = computed(() => {
    if (!activeSport.value) return [];
    return getSportVenues(activeSport.value.slug);
  });

  const getSportVenues = (sportSlug: string) => {
    const sportPitches = pitches.value.filter(
      (pitch) => pitch.typeOfSports === sportSlug
    );
    const uniqueVenueKeys = Array.from(
      new Set(sportPitches.map((pitch) => pitch.locationKey))
    );
    return locations.value.filter((location) =>
      uniqueVenueKeys.includes(location.key)
    );
  };

  const getSportByName = (sportName: string) => {
    return sportsStore.getSportByName(sportName);
  };

  return {
    activeSportVenues,
    getSportVenues,
    getSportByName,
  };
};
