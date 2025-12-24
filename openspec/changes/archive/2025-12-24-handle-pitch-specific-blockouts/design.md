# Design Document - Handle Pitch-Specific Blockouts

## Context

The admin system now supports creating pitch-specific blockouts with auto-release functionality. The customer-facing booking system must respect these blockouts by preventing users from selecting blocked time slots while maintaining a clear visual distinction between blocked, booked, and available slots.

**Key Constraints:**
- Pitch columns must remain visible even when all slots are blocked
- Visual indicators must be accessible (color + icon)
- Must support both location-wide and pitch-specific blockouts
- Must be backward compatible with existing blockouts
- Must handle auto-release days calculation

## Goals / Non-Goals

**Goals:**
- Prevent users from selecting blocked slots
- Provide clear visual feedback for blocked vs booked vs available slots
- Support pitch-specific and location-wide blockouts
- Support auto-release days feature
- Maintain backward compatibility

**Non-Goals:**
- Modifying blockout creation (handled in admin system)
- Hiding pitch columns when blocked
- Server-side validation (client-side prevention is sufficient for UX)

## Decisions

### 1. Data Model Alignment

**Decision:** Update `Blockout` type to match admin-side definition.

**Type Definition:**
```typescript
export type Blockout = {
  key: string;
  location: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
  
  // New optional fields
  targetSpecificPitches?: boolean;  // Default: false (location-wide)
  targetPitches?: string[];         // Pitch IDs/names (only used when targetSpecificPitches = true)
  autoReleaseDays?: number;         // Default: 0 (release on end date)
};
```

**Rationale:**
- Matches admin-side type definition for consistency
- Optional fields ensure backward compatibility
- Clear defaults (false, 0) for missing fields

### 2. Blockout Validation Logic

**Decision:** Implement `isBlockedByBlockout()` function similar to admin-side logic.

**Implementation:**
```typescript
function isBlockedByBlockout(
  date: string,
  pitch: Pitch,
  location: string,
  blockout: Blockout
): boolean {
  // Calculate effective end date (accounting for auto-release)
  const autoReleaseDays = blockout.autoReleaseDays || 0;
  const effectiveEndDate = dayjs(blockout.endDate)
    .subtract(autoReleaseDays, 'days')
    .format('YYYY-MM-DD');
  
  // Check date range with effective end date
  const bookingDate = dayjs(date, 'YYYY-MM-DD');
  const isWithinDateRange = 
    bookingDate.isSameOrAfter(blockout.startDate, 'day') &&
    bookingDate.isSameOrBefore(effectiveEndDate, 'day');
  
  if (!isWithinDateRange) {
    return false; // Not blocked - outside date range
  }
  
  // Check location match
  if (location !== blockout.location) {
    return false; // Not blocked - different location
  }
  
  // If pitch-specific, check if booking pitch is in blocked list
  if (blockout.targetSpecificPitches && blockout.targetPitches) {
    const pitchId = getPitchId(pitch);
    return blockout.targetPitches.some(targetPitch => 
      isPitchMatch(targetPitch, pitch)
    );
  }
  
  // Default: location-wide blockout blocks all pitches
  return true;
}
```

**Rationale:**
- Consistent with admin-side validation logic
- Handles auto-release days calculation
- Supports both location-wide and pitch-specific modes
- Reuses existing `isPitchMatch()` helper for pitch matching

### 3. Visual Design

**Decision:** Use distinct visual indicators for blocked, booked, and available slots.

**Visual Indicators:**
| State     | Icon                | Color | Clickable |
|-----------|---------------------|-------|-----------|
| Available | `mdi-check-circle`  | Gray  | Yes       |
| Selected  | `mdi-check-circle`  | Accent| Yes       |
| Booked    | `mdi-close-circle`  | Red   | No        |
| Blocked   | `mdi-block-helper`  | Gray  | No        |

**Template Structure:**
```vue
<div class="flex-grow-1">
  <!-- Booked slot -->
  <div v-if="checkBookedSlot(date, timeSlot, pitch)" class="time__slot">
    <v-icon color="red">mdi-close-circle</v-icon>
  </div>
  
  <!-- Blocked slot -->
  <div v-else-if="checkBlockedSlot(date, timeSlot, pitch)" class="time__slot">
    <v-tooltip text="Blocked">
      <template v-slot:activator="{ props }">
        <v-icon v-bind="props" color="grey">mdi-block-helper</v-icon>
      </template>
    </v-tooltip>
  </div>
  
  <!-- Available/Selectable slot -->
  <div v-else class="time__slot time__slot--button" @click="selectTimeslot(timeSlot, pitch)">
    <v-icon :color="checkSlot(date, timeSlot.start, pitch) ? accentColor : '#c9c9c9'">
      mdi-check-circle
    </v-icon>
  </div>
</div>
```

**Rationale:**
- Clear visual hierarchy: Booked (red) > Blocked (gray) > Available (gray/accent)
- Icon + color provides accessibility
- Tooltip provides additional context
- Maintains existing UI patterns

### 4. Component Integration

**Decision:** Pass blockouts as prop to `BookingFormTimeSelectorTable.vue` and fetch in parent component.

**Component Hierarchy:**
```
BookingFormPage1.vue
  └─ BookingFormTimeSelector.vue
       └─ BookingFormTimeSelectorTable.vue
```

**Data Flow:**
1. `BookingFormPage1.vue` fetches blockouts when location/date changes
2. `BookingFormTimeSelector.vue` receives blockouts and filters by location
3. `BookingFormTimeSelectorTable.vue` receives filtered blockouts and checks each slot

**Rationale:**
- Separation of concerns: fetching vs filtering vs rendering
- Reuses existing component structure
- Minimizes prop drilling

### 5. Pitch Matching Strategy

**Decision:** Reuse existing `isPitchMatch()` helper function.

**Implementation:**
```typescript
// Already exists in BookingFormTimeSelectorTable.vue
function isPitchMatch(slotPitch: string | number, pitch: Pitch): boolean {
  const slotPitchStr = String(slotPitch);
  const pitchId = getPitchId(pitch);
  
  // Direct match with pitch.id or pitch.name
  if (slotPitchStr === pitchId || slotPitchStr === pitch.name) {
    return true;
  }
  
  // Handle legacy "Pitch X" format
  const legacyMatch = slotPitchStr.match(/^Pitch\s+(\d+)$/i);
  if (legacyMatch) {
    const extractedNumber = legacyMatch[1];
    if (extractedNumber === pitchId || extractedNumber === pitch.name) {
      return true;
    }
  }
  
  return false;
}
```

**Rationale:**
- Already handles both new format (pitch.id) and legacy format (pitch.name, "Pitch X")
- Consistent with existing booked slot checking logic
- No duplication of pitch matching logic

## Risks / Trade-offs

### Risk: Performance with Many Blockouts
**Mitigation:** 
- Filter blockouts by location before passing to table component
- Only check blockouts within date range
- Use early returns in validation logic

### Risk: Visual Confusion Between Blocked and Booked
**Mitigation:**
- Use distinct icons (`mdi-block-helper` vs `mdi-close-circle`)
- Use tooltip to clarify state
- Consider different gray shades if needed

### Risk: Backward Compatibility
**Mitigation:**
- Use optional chaining and default values
- Test with old blockout records
- Graceful degradation (treat missing fields as defaults)

## Migration Plan

**No database migration required** - this is a client-side change only.

**Deployment Steps:**
1. Deploy admin-side changes first (create pitch-specific blockouts)
2. Deploy web-side changes (handle pitch-specific blockouts)
3. Test with both old and new blockout records
4. Monitor for any visual or functional issues

**Rollback:**
- If issues arise, revert web-side changes
- Existing blockouts will continue to work (just not enforced in UI)
- No data loss or corruption risk

## Open Questions

None - design is straightforward and follows existing patterns.

