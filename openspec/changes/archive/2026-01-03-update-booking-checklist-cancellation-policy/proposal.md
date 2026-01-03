# Update Booking Checklist Based on Pitch Cancellation Policy

## Why

Currently, the booking form checklist (BookingFormPage3CheckList.vue) displays three checkboxes to all users:
1. Terms and conditions acceptance
2. 72-hour notice requirement for rescheduling
3. Inclement weather policy adherence

However, pitches can be configured with `allowCancellation: false` in the admin portal, which prevents customers from canceling or rescheduling bookings for those pitches. When a booking contains only non-cancellable pitches, showing the 72-hour rescheduling notice and weather policy checkboxes is misleading and confusing to users, as these policies don't apply to bookings that cannot be cancelled or rescheduled.

## What Changes

- **Conditional checkbox display**: The second checkbox (72-hour rescheduling notice) and third checkbox (inclement weather policy) will be hidden when ALL selected time slots belong to pitches with `allowCancellation: false`
- **Dynamic validation logic**: The form validation will adapt to only require the terms and conditions checkbox when cancellation-related checkboxes are hidden
- **Pitch data access**: The checklist component will receive pitch information to determine cancellation policy
- **Backward compatibility**: Default behavior assumes `allowCancellation: true` for pitches without this property set

## Impact

### Affected Specs
- `booking-time-selection` - Adding new requirement for conditional checklist display based on pitch cancellation policy

### Affected Code

#### Modified Files
- `components/BookingFormPage3CheckList.vue` - Add props to receive grouped timeslots and pitch data, implement conditional rendering logic
- `components/BookingFormPage3.vue` - Pass grouped timeslots as prop to checklist component

#### Dependencies
- Requires access to pitches store (`usePitchesStore`) to look up pitch cancellation settings
- Uses existing `allowCancellation` property on Pitch type (already defined in `types/data.ts`)

### User Experience Impact
- **Improved clarity**: Users booking non-cancellable pitches won't see irrelevant cancellation/rescheduling policies
- **Reduced confusion**: Eliminates misleading information about policies that don't apply
- **Consistent with existing patterns**: Follows the same logic used in `ProfileBookingCard.vue` for hiding cancel/delete buttons

### Technical Considerations
- No database schema changes required
- No API changes required
- Component-level change with minimal risk
- Follows existing pattern from `ProfileBookingCard.vue:151-170` which already implements similar logic for showing/hiding cancel buttons

