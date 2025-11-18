# Design Document: Fix Pitch Locations Sport Filtering

## Context

The `SectionOurPitchLocations.vue` component displays venue addresses on contact pages. It's used on both sport-specific routes (`/[sportSlug]/contactus`) and the general contact page (`/contactus`).

**Current Behavior:**
- Component calls `sportsStore.getSportVenues(sportSlug)` to get filtered venues
- `getSportVenues` filters pitches by `typeOfSports` matching the sport slug
- However, it does NOT filter by pitch active status
- This can show venues that only have inactive pitches for a sport

**Expected Behavior:**
- Only show venues that have at least one active pitch for the specified sport
- Maintain consistency with other venue-listing components in the app

**Constraints:**
- Must maintain backward compatibility with existing data
- Must handle null `typeOfSports` (defaults to "futsal")
- Must not break other components using `getSportVenues`

## Goals / Non-Goals

**Goals:**
- Filter venues to only show those with active pitches for the sport
- Maintain consistency with pitch filtering across the application
- Improve data accuracy on contact pages

**Non-Goals:**
- Changing the UI/UX of the component
- Adding new features to venue display
- Modifying the Pitch data structure

## Decisions

### Decision 1: Filter by pitch.active Field

**Rationale:** The `Pitch` type includes an `active` boolean field. This is the primary indicator of whether a pitch should be displayed on the website.

**Implementation:** Add `.filter(pitch => pitch.active)` to the pitch filtering logic in `getSportVenues`.

**Alternatives Considered:**
- Using `websiteActive` field: This field exists but appears to be optional and not consistently used
- Using date-based filtering: Too complex and not the primary use case
- Filtering at component level: Would require duplicating logic across multiple components

### Decision 2: Apply Same Filtering to getSportPitches

**Rationale:** The `getSportPitches` method has the same issue and is used by other components. Fixing both ensures consistency.

**Implementation:** Apply the same active filtering to `getSportPitches` method.

**Alternatives Considered:**
- Only fixing `getSportVenues`: Would leave inconsistency in the codebase
- Creating a separate helper function: Adds unnecessary abstraction for simple filtering

### Decision 3: Keep Filtering Logic in Store

**Rationale:** The sports store is already responsible for venue/pitch filtering logic. Keeping it there maintains separation of concerns.

**Implementation:** Update methods in `stores/sports.ts`.

**Alternatives Considered:**
- Moving to component level: Would scatter business logic across components
- Creating a new composable: Overkill for this simple fix

## Technical Implementation

### Changes to stores/sports.ts

**Current `getSportVenues` method:**
```typescript
const getSportVenues = (sportSlug: string | null | undefined) => {
  if (!sportSlug) return []
  const lowerCaseSlug = sportSlug.toLowerCase()
  const locationsStore = useLocationsStore();
  const pitchesStore = usePitchesStore();

  // Filter pitches by sport type
  const sportPitches = pitchesStore.pitches.filter(
    (pitch) =>
    (pitch.typeOfSports === null && lowerCaseSlug === "futsal") ||
    (pitch.typeOfSports && pitch.typeOfSports.toLowerCase() === lowerCaseSlug)
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
```

**Updated `getSportVenues` method:**
```typescript
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
```

**Similar update needed for `getSportPitches` method.**

## Risks / Trade-offs

**Risk:** Venues with only inactive pitches will disappear from contact pages
- **Mitigation:** This is the intended behavior - we should only show venues where users can actually book

**Risk:** Breaking existing functionality that depends on seeing all venues
- **Mitigation:** Review all usages of `getSportVenues` and `getSportPitches` to ensure they expect active filtering

**Trade-off:** Slightly more complex filtering logic
- **Benefit:** More accurate data display and consistency across the app

## Migration Plan

1. Update `getSportVenues` method with active filtering
2. Update `getSportPitches` method with active filtering
3. Test all pages that use these methods:
   - `/[sportSlug]/contactus`
   - `/contactus`
   - `/[sportSlug]/venue`
   - Booking flow pages
4. Verify no regressions in venue display

**Rollback:** Simple - revert the changes to `stores/sports.ts`

## Open Questions

- Should we also filter by `websiteActive` field? (Need to check if it's consistently used)
- Should we add date-based filtering using `startDate`/`endDate` fields? (Probably not needed for this fix)

