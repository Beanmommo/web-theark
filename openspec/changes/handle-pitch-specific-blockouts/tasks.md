# Implementation Tasks - Handle Pitch-Specific Blockouts

## 1. Type Definitions

- [x] 1.1 Update `types/data.ts` Blockout type
  - Add `targetSpecificPitches?: boolean`
  - Add `targetPitches?: string[]`
  - Add `autoReleaseDays?: number`
- [x] 1.2 Verify type compatibility with admin-side types

## 2. Blockout Validation Logic

- [x] 2.1 Create helper function `isBlockedByBlockout()` in `components/BookingFormTimeSelectorTable.vue`
  - Calculate effective end date: `effectiveEndDate = endDate - autoReleaseDays days`
  - Check if booking date is within `startDate` to `effectiveEndDate` range
  - Check location match
  - If `targetSpecificPitches = true`, check if pitch is in `targetPitches` array
  - If `targetSpecificPitches = false`, block all pitches at location
  - Return boolean indicating if slot is blocked
- [x] 2.2 Add `checkBlockedSlot()` function
  - Accept date, timeslot, pitch, and blockouts array as parameters
  - Call `isBlockedByBlockout()` for each blockout
  - Return true if any blockout blocks the slot

## 3. UI Component Updates

- [x] 3.1 Update `BookingFormTimeSelectorTable.vue`
  - Add `blockouts` prop (Array<Blockout>)
  - Import and use blockouts in slot rendering
  - Add `checkBlockedSlot()` call in template
  - Add visual indicator for blocked slots (e.g., gray icon with mdi-block-helper or mdi-cancel)
  - Add tooltip showing blockout reason
  - Ensure blocked slots are not clickable
  - Maintain pitch column visibility (don't hide columns)
- [x] 3.2 Update `BookingFormTimeSelector.vue`
  - Fetch blockouts from store
  - Pass blockouts to `BookingFormTimeSelectorTable` component
  - Filter blockouts by location and date range

## 4. Store Integration

- [x] 4.1 Update `components/BookingFormPage1.vue`
  - Import `useBlockoutsStore`
  - Call `fetchBlockouts()` when component mounts or location changes
  - Ensure blockouts are available before rendering time selector

## 5. Visual Design

- [ ] 5.1 Design blocked slot indicator
  - Use distinct color (e.g., gray) different from booked (red) and available (green/gray)
  - Use appropriate icon (e.g., `mdi-block-helper`, `mdi-cancel`, or `mdi-lock`)
  - Ensure accessibility (color + icon)
- [ ] 5.2 Add tooltip for blocked slots
  - Show "Blocked" or "Unavailable due to blockout"
  - Consider showing blockout date range in tooltip

## 6. Testing

- [ ] 6.1 Test location-wide blockouts
  - Create location-wide blockout in admin
  - Verify all pitches at location are blocked in booking UI
  - Verify other locations are not affected
- [ ] 6.2 Test pitch-specific blockouts
  - Create pitch-specific blockout for 1-2 pitches
  - Verify only selected pitches show blocked slots
  - Verify other pitches at same location remain selectable
- [ ] 6.3 Test auto-release days
  - Create blockout with `autoReleaseDays = 3`
  - Verify slots are blocked until effective end date
  - Verify slots are available after effective end date
- [ ] 6.4 Test visual indicators
  - Verify blocked slots show correct icon and color
  - Verify tooltip displays on hover
  - Verify blocked slots are not clickable
- [ ] 6.5 Test backward compatibility
  - Verify existing blockouts without new fields work as location-wide blocks
  - Test with missing `targetSpecificPitches` field (should default to false)
  - Test with missing `autoReleaseDays` field (should default to 0)
- [ ] 6.6 Test edge cases
  - Multiple overlapping blockouts (location-wide + pitch-specific)
  - Blockout spanning multiple days
  - Same-day blockouts with different auto-release settings
  - Blockouts for different sports at same location

## 7. Documentation

- [ ] 7.1 Update component documentation
  - Document new props and functions
  - Add code comments explaining blockout logic
- [ ] 7.2 Add inline comments for complex logic
  - Explain effective end date calculation
  - Document pitch matching logic
