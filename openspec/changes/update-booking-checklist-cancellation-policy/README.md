# Update Booking Checklist Based on Pitch Cancellation Policy

## Overview

This OpenSpec change proposal updates the booking form checklist to conditionally display cancellation-related checkboxes based on whether the selected pitches allow cancellation. This improves user experience by hiding irrelevant policy checkboxes when booking non-cancellable pitches.

## Quick Links

- **Proposal**: [proposal.md](./proposal.md)
- **Tasks**: [tasks.md](./tasks.md)
- **Spec Deltas**: [specs/booking-time-selection/spec.md](./specs/booking-time-selection/spec.md)

## Status

- **Created**: 2026-01-03
- **Status**: Pending Approval
- **Change ID**: `update-booking-checklist-cancellation-policy`

## Summary

### Problem

The booking form currently shows three checkboxes to all users:
1. Terms and conditions acceptance (always required)
2. 72-hour notice requirement for rescheduling
3. Inclement weather policy adherence

However, pitches can be configured with `allowCancellation: false` in the admin portal. When users book these non-cancellable pitches, showing rescheduling and weather policy checkboxes is misleading since these policies don't apply.

### Solution

Conditionally hide the second and third checkboxes when ALL selected time slots belong to pitches with `allowCancellation: false`. The form validation will adapt to only require the terms checkbox in this case.

### Key Changes

1. **BookingFormPage3CheckList.vue**:
   - Add props to receive grouped timeslots
   - Access pitches store to check cancellation policy
   - Implement `allowsCancellation` computed property
   - Conditionally render checkboxes 2 and 3 with `v-if`
   - Update validation logic to adapt to visible checkboxes

2. **BookingFormPage3.vue**:
   - Pass `groupedTimeslots` prop to checklist component

### Behavior

| Scenario | Checkboxes Shown | Validation Required |
|----------|------------------|---------------------|
| All pitches allow cancellation | All 3 checkboxes | Terms + Weather |
| All pitches don't allow cancellation | Only Terms checkbox | Terms only |
| Mixed pitches | Only Terms checkbox | Terms only |
| Pitches without property (legacy) | All 3 checkboxes | Terms + Weather |

### Consistency with Existing Code

This change follows the same pattern used in `ProfileBookingCard.vue` (lines 151-170), which already implements similar logic for conditionally showing/hiding cancel and delete buttons based on pitch cancellation policy.

## Implementation Notes

- No database schema changes required
- No API changes required
- Uses existing `allowCancellation` property on Pitch type
- Backward compatible (defaults to showing all checkboxes)
- Low risk, component-level change

## Testing Checklist

- [ ] Test with all cancellable pitches (default behavior)
- [ ] Test with all non-cancellable pitches
- [ ] Test with mixed pitches
- [ ] Test with legacy pitches (no allowCancellation property)
- [ ] Verify form submission works in all scenarios

