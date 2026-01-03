# OpenSpec Proposal Summary
## Update Booking Checklist Based on Pitch Cancellation Policy

---

## 📋 Quick Reference

| Property | Value |
|----------|-------|
| **Change ID** | `update-booking-checklist-cancellation-policy` |
| **Status** | ✅ Validated - Pending Approval |
| **Created** | 2026-01-03 |
| **Affected Specs** | `booking-time-selection` |
| **Risk Level** | Low (component-level change) |
| **Breaking Changes** | None |

---

## 🎯 Problem Statement

The booking form checklist currently displays three checkboxes to all users:

1. ✅ **Terms and conditions** (always relevant)
2. ⚠️ **72-hour rescheduling notice** (only relevant if cancellation allowed)
3. ⚠️ **Inclement weather policy** (only relevant if cancellation allowed)

**Issue**: Pitches can be configured with `allowCancellation: false` in the admin portal. When users book these non-cancellable pitches, showing checkboxes #2 and #3 is **misleading** because:
- Users cannot reschedule these bookings
- Weather policy doesn't apply to non-cancellable bookings
- Creates confusion about what policies actually apply

---

## 💡 Proposed Solution

**Conditionally hide checkboxes #2 and #3** when ALL selected time slots belong to pitches with `allowCancellation: false`.

### Decision Logic

```
IF any selected pitch has allowCancellation = false THEN
    Show only: Terms & Conditions checkbox
    Require only: Terms checkbox to be checked
ELSE
    Show all: Terms, Rescheduling, Weather checkboxes
    Require: Terms AND Weather checkboxes to be checked
END IF
```

---

## 📊 Behavior Matrix

| Pitch Configuration | Checkboxes Displayed | Validation Required |
|---------------------|---------------------|---------------------|
| All pitches: `allowCancellation: true` | 1, 2, 3 | Terms + Weather |
| All pitches: `allowCancellation: false` | 1 only | Terms only |
| Mixed pitches (some true, some false) | 1 only | Terms only |
| Legacy pitches (property undefined) | 1, 2, 3 | Terms + Weather |

**Conservative Approach**: If ANY pitch doesn't allow cancellation, hide the cancellation-related checkboxes.

---

## 🔧 Technical Implementation

### Files Modified

1. **`components/BookingFormPage3CheckList.vue`**
   - Add `groupedTimeslots` prop
   - Import `usePitchesStore` and `useLocationsStore`
   - Create `allowsCancellation` computed property
   - Add `v-if="allowsCancellation"` to checkboxes 2 & 3
   - Update `inputHandler()` validation logic

2. **`components/BookingFormPage3.vue`**
   - Pass `:groupedTimeslots="groupedTimeslots"` to checklist component

### Pitch Matching Logic

For each selected slot, find the corresponding pitch by matching:
- `locationKey` (exact match)
- `pitch` name (slot.pitch === pitch.name)
- `typeOfSports` (case-insensitive)

If no match found → default to allowing cancellation (show all checkboxes)

---

## 🔄 Consistency with Existing Code

This proposal follows the **exact same pattern** already implemented in:

**`ProfileBookingCard.vue` (lines 151-170)**
```typescript
// Existing code that checks allowCancellation for showing cancel buttons
const allowCancellation = computed(() => {
  for (const slot of bookingSlots.value) {
    const pitch = pitchesStore.pitches.find(
      (p) => p.locationKey === location.key &&
            p.name === String(slot.pitch) &&
            p.typeOfSports?.toLowerCase() === slot.typeOfSports?.toLowerCase()
    );
    if (pitch && pitch.allowCancellation === false) {
      return false;
    }
  }
  return true;
});
```

**Our proposal uses the same logic** for the booking form checklist.

---

## ✅ Validation Status

```bash
$ openspec validate update-booking-checklist-cancellation-policy --strict
✓ Change 'update-booking-checklist-cancellation-policy' is valid
```

---

## 📦 Deliverables

- ✅ `proposal.md` - Problem statement and solution overview
- ✅ `tasks.md` - Detailed implementation checklist (4 sections, 30+ tasks)
- ✅ `specs/booking-time-selection/spec.md` - Spec delta with 7 scenarios
- ✅ `README.md` - Quick reference and overview
- ✅ `SUMMARY.md` - This comprehensive summary

---

## 🧪 Testing Scenarios

1. **All cancellable pitches** → Show all 3 checkboxes
2. **All non-cancellable pitches** → Show only terms checkbox
3. **Mixed pitches** → Show only terms checkbox (conservative)
4. **Legacy pitches** (no property) → Show all 3 checkboxes (backward compatible)
5. **Form submission** → Works correctly in all scenarios

---

## 🚀 Next Steps

1. **Review this proposal** with stakeholders
2. **Approve or request changes**
3. Upon approval:
   - Create GitHub issue
   - Create feature branch
   - Implement according to `tasks.md`
   - Test all scenarios
   - Create PR with "Closes #[issue-number]"

---

## 📚 Related Documentation

- Admin Portal: Pitch configuration with `allowCancellation` toggle
- Existing implementation: `ProfileBookingCard.vue:151-170`
- Type definition: `types/data.ts` - Pitch interface with `allowCancellation?: boolean`

