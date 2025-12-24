# Handle Pitch-Specific Blockouts

## Why

The admin system now supports pitch-specific blockouts with auto-release functionality (see `admin-theark-new/openspec/changes/add-pitch-specific-blockouts`). The customer-facing booking system needs to respect these blockouts by:

1. Preventing users from selecting blocked time slots for specific pitches
2. Displaying blocked slots visually (similar to booked slots)
3. Supporting both location-wide and pitch-specific blockouts
4. Respecting the auto-release days feature

Currently, blockouts are fetched but not used to disable slots in the booking UI, allowing users to attempt bookings during blocked periods.

## What Changes

### Data Model Updates
- Update `Blockout` type in `types/data.ts` to include:
  - `targetSpecificPitches?: boolean`
  - `targetPitches?: string[]`
  - `autoReleaseDays?: number`

### UI Changes
- Modify `BookingFormTimeSelectorTable.vue` to check blockouts when rendering slots
- Display blocked slots with a distinct visual indicator (e.g., gray blocked icon)
- Keep pitch columns visible but disable blocked slots (as per requirement)
- Show tooltip on hover explaining why slot is blocked

### Validation Logic
- Add `checkBlockedSlot()` function to validate against blockouts
- Calculate effective end date using `autoReleaseDays`
- Check location-wide blockouts (when `targetSpecificPitches = false`)
- Check pitch-specific blockouts (when `targetSpecificPitches = true`)
- Prevent selection of blocked slots

### Store Updates
- Ensure blockouts are fetched and available in booking flow
- Add helper methods for blockout validation

## Impact

### Affected Specs
- `specs/booking-time-selection/spec.md` - Add blockout validation requirements

### Affected Code
- `types/data.ts` - Update Blockout type definition
- `components/BookingFormTimeSelectorTable.vue` - Add blockout checking logic
- `components/BookingFormTimeSelector.vue` - Pass blockouts to table component
- `stores/blockouts.ts` - Ensure blockouts are fetched during booking flow
- `components/BookingFormPage1.vue` - Fetch blockouts when location/date selected

### User Experience
- **Improved**: Users cannot select blocked slots, preventing booking errors
- **Visual Clarity**: Blocked slots clearly distinguished from available/booked slots
- **Transparency**: Tooltip explains why slot is unavailable

### Backward Compatibility
- Fully backward compatible - existing blockouts without new fields work as location-wide blocks
- No database migration required
- Graceful handling of missing optional fields

## Dependencies

This change depends on the admin-side implementation:
- `admin-theark-new/openspec/changes/add-pitch-specific-blockouts`

The admin system must be deployed first to create pitch-specific blockouts before this change is deployed.

## Testing Considerations

1. Test location-wide blockouts (existing behavior)
2. Test pitch-specific blockouts (new behavior)
3. Test auto-release days calculation
4. Test visual indicators for blocked vs booked vs available slots
5. Test tooltip display
6. Test backward compatibility with old blockout records

