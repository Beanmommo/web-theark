export const useSport = () => {
  const sportsStore = useSportsStore();
  const { activeSport } = storeToRefs(sportsStore);

  const locationsStore = useLocationsStore();
  const { locations } = storeToRefs(locationsStore);

  const pitchesStore = usePitchesStore();
  const { pitches } = storeToRefs(pitchesStore);

  const sportPitches = computed(() => {
    if (!activeSport.value) return [];
    return pitches.value.filter(
      (pitch) => pitch.typeOfSports === activeSport.value?.name
    );
  });

  const activeSportVenues = computed(() => {
    if (!activeSport.value) return [];
    return getSportVenues(activeSport.value.name);
  });

  const getSportVenues = (sportName: string) => {
    const sportPitches = pitches.value.filter(
      (pitch) => pitch.typeOfSports === sportName
    );
    const uniqueVenueKeys = Array.from(
      new Set(sportPitches.map((pitch) => pitch.locationKey))
    );
    return locations.value.filter((location) =>
      uniqueVenueKeys.includes(location.key)
    );
  };

  return {
    activeSportVenues,
    getSportVenues,
  };
};
