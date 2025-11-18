# Implementation Tasks

## 1. Analysis

- [x] 1.1 Review current `getSportVenues` implementation in `stores/sports.ts`
- [x] 1.2 Identify pitch active status fields used elsewhere in codebase
- [x] 1.3 Verify how `pitch.active` and `pitch.websiteActive` are used in other components
- [x] 1.4 Confirm the expected behavior with similar components

## 2. Implementation

- [x] 2.1 Update `getSportVenues` method to filter by `pitch.active === true`
- [x] 2.2 Add filtering for `pitch.websiteActive` if applicable based on codebase patterns
- [x] 2.3 Ensure null/undefined `typeOfSports` continues to default to "futsal"
- [x] 2.4 Update `getSportPitches` method with same active filtering for consistency

## 3. Testing

- [ ] 3.1 Test `/futsal/contactus` page shows only venues with active futsal pitches
- [ ] 3.2 Test `/pickleball/contactus` page shows only venues with active pickleball pitches
- [ ] 3.3 Test `/contactus` page (without sport slug) shows all active venues
- [ ] 3.4 Verify `SectionSportVenues` component still works correctly
- [ ] 3.5 Verify booking flow still shows correct venues

## 4. Documentation

- [x] 4.1 Update code comments in `getSportVenues` to document active filtering
- [x] 4.2 Update code comments in `getSportPitches` to document active filtering
