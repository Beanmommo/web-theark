# Implementation Tasks

## 1. Update BookingFormPage3CheckList Component

- [x] 1.1 Add props to receive `groupedTimeslots` (GroupedTimeslots type)
- [x] 1.2 Import and use `usePitchesStore` to access pitch data
- [x] 1.3 Import and use `useLocationsStore` to access location data
- [x] 1.4 Create computed property `allowsCancellation` that:
  - [x] 1.4.1 Extracts all slots from grouped timeslots
  - [x] 1.4.2 Finds corresponding pitch for each slot (matching locationKey, pitch name, and typeOfSports)
  - [x] 1.4.3 Returns `false` if ANY pitch has `allowCancellation === false`
  - [x] 1.4.4 Returns `true` by default (when all pitches allow cancellation or property is undefined)
- [x] 1.5 Add `v-if="allowsCancellation"` directive to second checkbox (72-hour notice)
- [x] 1.6 Add `v-if="allowsCancellation"` directive to third checkbox (inclement weather)
- [x] 1.7 Update `inputHandler` function to:
  - [x] 1.7.1 Check if `allowsCancellation` is false
  - [x] 1.7.2 If false, only validate `terms` checkbox
  - [x] 1.7.3 If true, validate both `terms` and `covid` checkboxes (existing logic)
- [x] 1.8 Update reactive refs:
  - [x] 1.8.1 Keep `terms` ref for first checkbox
  - [x] 1.8.2 Keep `covid` ref for third checkbox (conditionally displayed)
  - [x] 1.8.3 Remove v-model from second checkbox (it's display-only, not validated)

## 2. Update BookingFormPage3 Parent Component

- [x] 2.1 Pass `groupedTimeslots` prop to `BookingFormPage3CheckList` component
- [x] 2.2 Verify prop binding: `:groupedTimeslots="groupedTimeslots"`

## 3. Testing

- [ ] 3.1 Test with all pitches allowing cancellation (default behavior)
  - [ ] 3.1.1 Verify all three checkboxes are visible
  - [ ] 3.1.2 Verify form requires both terms and covid checkboxes
- [ ] 3.2 Test with at least one pitch having `allowCancellation: false`
  - [ ] 3.2.1 Verify only terms checkbox is visible
  - [ ] 3.2.2 Verify second and third checkboxes are hidden
  - [ ] 3.2.3 Verify form only requires terms checkbox
- [ ] 3.3 Test with mixed pitches (some allow, some don't)
  - [ ] 3.3.1 Verify checkboxes are hidden (conservative approach)
- [ ] 3.4 Test with pitches that don't have `allowCancellation` property
  - [ ] 3.4.1 Verify default behavior (show all checkboxes)
- [ ] 3.5 Test form submission with different scenarios
  - [ ] 3.5.1 Verify booking completes successfully in both cases

## 4. Documentation

- [ ] 4.1 Update component comments to document the conditional rendering logic
- [ ] 4.2 Add JSDoc comments for the `allowsCancellation` computed property
