# Add Singapore Timezone-Based Slot Filtering

## Why

Currently, the BookingFormTimeSelector displays all available time slots for the selected date without considering the current time. This allows users to book slots that have already passed, which creates a poor user experience and potential booking conflicts.

For example:
- A user in Australia (1:00 PM AEDT) accesses the booking form
- Singapore time is 10:00 AM SGT
- For today's date, the system should only show slots from 11:00 AM onwards (1 hour after current Singapore time)
- Currently, all slots from the start of the day are shown, including past slots

The business operates on Singapore timezone (Asia/Singapore) regardless of where users are accessing the system from, so all time-based filtering must be based on Singapore time.

## What Changes

- Add time-based filtering to `BookingFormTimeSelector.vue` component's `initialiseTimeslots()` function
- Filter out time slots that are less than 1 hour from the current Singapore time when the selected date is today
- Use Singapore timezone (`Asia/Singapore`) for all time comparisons, regardless of user's location
- Display time slots based on the configured `timeSlots` data format (not timezone-adjusted)
- Preserve existing functionality for future dates (no filtering needed)
- Preserve existing holiday and sport-specific filtering logic

## Impact

### Affected Components
- `components/BookingFormTimeSelector.vue` - Main component requiring modification

### Affected Functionality
- Time slot generation and filtering logic in `initialiseTimeslots()` function
- User experience: Users will no longer see past time slots for today's bookings

### Technical Considerations
- Day.js is already configured with timezone plugin and `Asia/Singapore` as default timezone (see `nuxt.config.ts`)
- The `useDayjs()` composable is already available in the component
- Time slot display format remains unchanged (e.g., "9am", "10am")
- No database schema changes required
- No API changes required

### User Experience Impact
- **Positive**: Prevents booking of past time slots
- **Positive**: Reduces confusion about available slots
- **Positive**: Works correctly for international users
- **Neutral**: Future dates remain unaffected

### Breaking Changes
None - This is an enhancement that adds filtering logic without changing existing APIs or data structures.

