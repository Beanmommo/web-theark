# Fix SectionOurPitchLocations Sport Filtering

## Why

The `SectionOurPitchLocations.vue` component is not properly filtering venues by sport when accessed via sport-specific routes (e.g., `/futsal/contactus` or `/pickleball/contactus`). The component currently displays addresses for all active locations regardless of whether they have pitches for the specific sport indicated by `route.params.sportSlug`.

**Current Issues:**
1. The component relies on `sportsStore.getSportVenues(sportSlug)` which correctly filters venues by sport
2. However, the `getSportVenues` method in the sports store does not filter out inactive pitches
3. This means venues may appear even if they only have inactive pitches for that sport
4. The filtering logic is inconsistent with other components like `SectionSportVenues.vue` and `BookingFormPage1.vue`

## What Changes

- **Update `getSportVenues` method** in `stores/sports.ts` to filter pitches by active status before determining which venues to display
- Add filtering for `pitch.active` field (and optionally `pitch.websiteActive` if applicable)
- Ensure consistency with pitch filtering logic used in other components throughout the codebase
- The component `SectionOurPitchLocations.vue` itself does not need changes - the fix is in the store method it depends on

**Technical Details:**
- Filter pitches where `pitch.active === true` (at minimum)
- Consider `pitch.websiteActive` if it's being used elsewhere in the codebase
- Maintain backward compatibility with null `typeOfSports` values (treated as "futsal")
- Preserve existing location active status filtering

## Impact

**Affected Specs:**
- `venue-display` (if exists) - venue filtering logic
- Contact page functionality

**Affected Code:**
- `stores/sports.ts` - `getSportVenues()` method
- `components/SectionOurPitchLocations.vue` - indirectly benefits from the fix
- Any other components using `getSportVenues()` will also benefit from more accurate filtering

**User Impact:**
- Users will only see venue locations that have active pitches for the selected sport
- Contact pages will show accurate venue information per sport
- Improved consistency across the application

**Breaking Changes:**
- None - this is a bug fix that restores intended behavior

