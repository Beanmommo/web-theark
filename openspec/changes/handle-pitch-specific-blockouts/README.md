# Handle Pitch-Specific Blockouts

## Overview

This change enables the customer-facing booking system to respect pitch-specific blockouts created in the admin system. Users will be prevented from selecting blocked time slots, with clear visual indicators distinguishing blocked slots from booked and available slots.

## Status

📋 **Proposed** - Awaiting approval

## Key Changes

### 1. Data Model

Extends the `Blockout` type with three new optional fields:

```typescript
{
  targetSpecificPitches?: boolean;  // Toggle for pitch-specific mode
  targetPitches?: string[];         // Array of pitch IDs to block
  autoReleaseDays?: number;         // Days before end date to auto-release (default: 0)
}
```

### 2. User Interface

- **Visual Indicators**: Distinct icons for blocked (gray block icon) vs booked (red X) vs available (gray/green check)
- **Pitch Columns**: Remain visible even when all slots are blocked
- **Tooltips**: Hover over blocked slots to see "Blocked" message
- **Non-clickable**: Blocked slots cannot be selected

### 3. Validation Logic

- **Location-wide blockouts**: Block all pitches at a location
- **Pitch-specific blockouts**: Block only targeted pitches
- **Auto-release**: Calculate effective end date and release slots early
- **Backward compatible**: Handle old blockouts without new fields

## Use Cases

### Use Case 1: Maintenance on Specific Pitches

**Scenario**: Pitch 1 and Pitch 2 are under maintenance Jan 15-20, but Pitch 3 and Pitch 4 remain available.

**User Experience**:
- User selects location and date Jan 17
- Booking grid shows all 4 pitch columns
- Slots for Pitch 1 and Pitch 2 show gray block icon (not clickable)
- Slots for Pitch 3 and Pitch 4 show check icon (clickable if not booked)

### Use Case 2: Venue-Wide Closure

**Scenario**: Entire venue closed for public holiday Jan 15-17.

**User Experience**:
- User selects location and date Jan 16
- Booking grid shows all pitch columns
- All slots show gray block icon (not clickable)
- User must select a different date or location

### Use Case 3: Event with Early Release

**Scenario**: Event runs Jan 15-20, but pitches released on Jan 18 (autoReleaseDays = 2).

**User Experience**:
- User selects date Jan 17: All slots blocked
- User selects date Jan 18: All slots available (auto-released)
- User selects date Jan 19: All slots available

## Visual Design

### Slot States

| State     | Icon               | Color  | Clickable | Tooltip |
|-----------|--------------------|--------|-----------|---------|
| Available | `mdi-check-circle` | Gray   | ✅        | -       |
| Selected  | `mdi-check-circle` | Accent | ✅        | -       |
| Booked    | `mdi-close-circle` | Red    | ❌        | -       |
| Blocked   | `mdi-block-helper` | Gray   | ❌        | "Blocked" |

### Example Grid

```
Time        Rate    Pitch 1    Pitch 2    Pitch 3    Pitch 4
9am-10am    $50     🚫 (blocked) 🚫 (blocked) ✓ (available) ✓ (available)
10am-11am   $50     🚫 (blocked) 🚫 (blocked) ✓ (available) ❌ (booked)
11am-12pm   $60     🚫 (blocked) 🚫 (blocked) ✓ (available) ✓ (available)
```

## Implementation Highlights

### Reused Components

- `isPitchMatch()` - Existing pitch matching logic (handles legacy formats)
- `checkBookedSlot()` - Pattern for checking slot availability
- `BookingFormTimeSelectorTable.vue` - Existing slot grid component

### New Functions

- `isBlockedByBlockout()` - Core validation logic
- `checkBlockedSlot()` - Wrapper for checking all blockouts

### Modified Components

- `types/data.ts` - Updated Blockout type
- `BookingFormTimeSelectorTable.vue` - Added blockout checking
- `BookingFormTimeSelector.vue` - Pass blockouts to table
- `BookingFormPage1.vue` - Fetch blockouts on mount

## Dependencies

**Requires admin-side implementation:**
- `admin-theark-new/openspec/changes/add-pitch-specific-blockouts`

**Deployment Order:**
1. Deploy admin-side changes first
2. Deploy web-side changes second

## Testing Checklist

- [ ] Location-wide blockouts block all pitches
- [ ] Pitch-specific blockouts block only targeted pitches
- [ ] Auto-release days release slots early
- [ ] Visual indicators are distinct and clear
- [ ] Tooltips display on hover
- [ ] Blocked slots are not clickable
- [ ] Backward compatibility with old blockouts
- [ ] Multiple overlapping blockouts handled correctly
- [ ] Different locations not affected by each other's blockouts

## Files Changed

- `types/data.ts` - Blockout type definition
- `components/BookingFormTimeSelectorTable.vue` - Blockout checking logic
- `components/BookingFormTimeSelector.vue` - Pass blockouts to table
- `components/BookingFormPage1.vue` - Fetch blockouts

## Validation

Run validation:
```bash
cd web-theark-multisports
openspec validate handle-pitch-specific-blockouts --strict
```

## Related Changes

- Admin: `admin-theark-new/openspec/changes/add-pitch-specific-blockouts`

