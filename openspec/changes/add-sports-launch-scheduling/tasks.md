# Implementation Tasks

## 1. Type Definitions and Config Store

- [x] 1.1 Update `Sport` type in `types/sport.ts` to include optional scheduling fields
- [x] 1.2 Create or update config store to fetch sports configuration from Firebase
- [x] 1.3 Add type definitions for Firebase config sports structure

## 2. Sports Store Refactoring

- [x] 2.1 Replace hardcoded sports array with reactive ref initialized as empty
- [x] 2.2 Add `fetchSports()` method to load sports from Firebase config
- [x] 2.3 Implement date-based filtering to hide sports before `websiteStartDate`
- [x] 2.4 Add `isBookingEnabled(sportSlug)` method to check `websitePublishDate`
- [x] 2.5 Add `getBookingLaunchDate(sportSlug)` method to retrieve publish date for display
- [x] 2.6 Ensure existing methods (`getSportBySlug`, `getSportPitches`, etc.) continue to work
- [x] 2.7 Call `fetchSports()` on store initialization

## 3. Quick Booking Component Updates

- [ ] 3.1 Import and use `isBookingEnabled()` from sports store
- [ ] 3.2 Add computed property to check if booking is enabled for active sport
- [ ] 3.3 Create "Coming Soon" state UI component/section
- [ ] 3.4 Display booking launch date if available when showing "Coming Soon"
- [ ] 3.5 Conditionally render booking form OR "Coming Soon" based on booking status
- [ ] 3.6 Style "Coming Soon" state to match existing design system

## 4. Booking Page Updates

- [ ] 4.1 Add booking status check on page load in `pages/[sportSlug]/booking/index.vue`
- [ ] 4.2 Create "Coming Soon" banner component for booking page
- [ ] 4.3 Display launch date and call-to-action when booking is disabled
- [ ] 4.4 Hide booking forms (date picker, time slots, etc.) when booking is disabled
- [ ] 4.5 Show informational content about the sport while booking is disabled
- [ ] 4.6 Ensure direct navigation to booking page shows appropriate state

## 5. Data Migration

- [x] 5.1 Document process for migrating existing sports (Futsal, Pickleball) to Firebase
- [x] 5.2 Create migration script or manual steps to populate Firebase config
- [x] 5.3 Verify existing sports work after migration

## 6. Testing

- [ ] 6.1 Test sport visibility with various `websiteStartDate` values (past, future, null)
- [ ] 6.2 Test booking availability with various `websitePublishDate` values
- [ ] 6.3 Test "Coming Soon" state in Quick Booking component
- [ ] 6.4 Test "Coming Soon" state on booking page via direct navigation
- [ ] 6.5 Test backward compatibility with sports missing new fields
- [ ] 6.6 Test sport filtering and venue/pitch associations still work correctly
- [ ] 6.7 Test routing to sport pages works for all configured sports
