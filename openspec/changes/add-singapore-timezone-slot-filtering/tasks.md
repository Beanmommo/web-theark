# Implementation Tasks

## 1. Implementation

- [x] 1.1 Add Singapore timezone current time calculation in `initialiseTimeslots()` function
- [x] 1.2 Add logic to detect if selected date is today (in Singapore timezone)
- [x] 1.3 Add filtering logic to exclude slots that start less than 1 hour from current Singapore time
- [x] 1.4 Ensure time slot generation loop respects the new filtering
- [x] 1.5 Test with various scenarios (today, future dates, different user timezones)

## 2. Testing Scenarios

- [ ] 2.1 Verify slots are filtered correctly when booking for today
- [ ] 2.2 Verify all slots show for future dates
- [ ] 2.3 Verify filtering works correctly across midnight boundary
- [ ] 2.4 Verify filtering works for users in different timezones (simulate Australia, US, Europe)
- [ ] 2.5 Verify holiday slots are still filtered correctly
- [ ] 2.6 Verify sport-specific filtering still works
- [ ] 2.7 Verify multi-hour slots (2-hour slots) are filtered correctly

## 3. Documentation

- [ ] 3.1 Add inline comments explaining the timezone filtering logic
- [ ] 3.2 Document the 1-hour buffer requirement in code comments
