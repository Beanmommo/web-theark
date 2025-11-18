# Design: Singapore Timezone-Based Slot Filtering

## Context

The Ark operates sports facilities in Singapore and uses Singapore timezone (Asia/Singapore) as the business timezone. Users can access the booking system from anywhere in the world, but all bookings and time-based operations must be based on Singapore time.

The current implementation generates time slots based on configured timeslot data but doesn't filter out slots that have already passed. This creates a poor user experience and potential for booking conflicts.

### Current Behavior
1. User selects a date from the date picker
2. System generates all time slots for that date based on:
   - Day of week (Mon, Tue, etc.)
   - Holiday status
   - Sport type (futsal, pickleball, etc.)
   - Timeslot configuration (start time, end time, rate, etc.)
3. All generated slots are displayed regardless of current time

### Desired Behavior
1. Same as current for steps 1-2
2. Additional filtering: If selected date is today (Singapore time), filter out slots that start less than 1 hour from current Singapore time
3. Display only available future slots

## Goals / Non-Goals

### Goals
- Filter time slots based on Singapore timezone current time
- Maintain 1-hour minimum booking buffer
- Work correctly for users in any timezone
- Preserve all existing filtering logic (holidays, sports, date ranges)
- Keep time slot display format unchanged

### Non-Goals
- Change time slot display format or timezone
- Modify timeslot configuration data structure
- Add user timezone preferences
- Change booking validation logic (handled elsewhere)
- Modify date picker behavior

## Decisions

### Decision 1: Use Singapore Timezone for All Time Comparisons

**Rationale**: The business operates in Singapore, and all facilities are in Singapore. Using Singapore time ensures consistency regardless of where users access the system.

**Implementation**: Use `dayjs().tz('Asia/Singapore')` for current time and `dayjs(date).tz('Asia/Singapore')` for date comparisons.

**Alternatives Considered**:
- User's local timezone: Rejected because it would create inconsistency and confusion
- UTC: Rejected because it adds unnecessary conversion complexity

### Decision 2: 1-Hour Minimum Buffer

**Rationale**: Provides reasonable time for users to complete booking and arrive at facility. Aligns with business requirements.

**Implementation**: Filter out slots where `slotStartTime < currentSingaporeTime + 1 hour`

**Alternatives Considered**:
- 30-minute buffer: Rejected as too short for booking completion and travel
- 2-hour buffer: Rejected as too restrictive for last-minute bookings

### Decision 3: Filter During Slot Generation

**Rationale**: Most efficient to filter during the generation loop rather than post-processing.

**Implementation**: Add condition in the `while (current.isBefore(slotEnd))` loop to skip slots that are too soon.

**Alternatives Considered**:
- Post-processing filter: Less efficient, requires iterating twice
- Pre-filter timeslot configurations: Doesn't work because slots are generated dynamically

### Decision 4: Only Filter for Today's Date

**Rationale**: Future dates don't need filtering as all slots are valid. Past dates are already handled by date picker restrictions.

**Implementation**: 
```javascript
const isToday = dayjs(date).tz('Asia/Singapore').isSame(dayjs().tz('Asia/Singapore'), 'day')
```

## Technical Implementation

### Key Changes to `initialiseTimeslots()` Function

```javascript
function initialiseTimeslots() {
  timeSlots.value = []
  const date = props.date
  
  // Get current Singapore time
  const nowSingapore = dayjs().tz('Asia/Singapore')
  const selectedDateSingapore = dayjs(date).tz('Asia/Singapore')
  const isToday = selectedDateSingapore.isSame(nowSingapore, 'day')
  
  // Calculate minimum bookable time (1 hour from now)
  const minBookableTime = isToday ? nowSingapore.add(1, 'hour') : null
  
  // ... existing holiday and sport filtering ...
  
  sortedTimeslots.forEach(slotDetails => {
    let current = dayjs(`${date} ${slotDetails.startTime}`, "YYYY-MM-DD hh:mm")
    const slotEnd = dayjs(`${date} ${slotDetails.endTime}`, "YYYY-MM-DD hh:mm")

    while (current.isBefore(slotEnd)) {
      // ... existing overlap check ...
      
      // NEW: Skip slots that are too soon for today
      if (minBookableTime && current.isBefore(minBookableTime)) {
        current = current.add(addDuration, "hour")
        continue
      }
      
      // ... rest of slot generation logic ...
    }
  })
}
```

### Edge Cases Handled

1. **Midnight boundary**: If current time is 11:30 PM, minimum bookable time is 12:30 AM next day - correctly filtered by date check
2. **Multi-hour slots**: 2-hour slots starting at 10 AM filtered if current time is 9:30 AM (slot starts before 10:30 AM minimum)
3. **Different user timezones**: All comparisons use Singapore timezone, so user's local timezone doesn't affect filtering
4. **Holiday slots**: Existing holiday filtering runs first, then time filtering applies
5. **Sport-specific slots**: Existing sport filtering runs first, then time filtering applies

## Risks / Trade-offs

### Risk: User Confusion About Missing Slots
**Mitigation**: This is actually a positive - users won't see slots they can't book. The UI already shows the date, making it clear why certain times aren't available.

### Risk: Timezone Plugin Not Loaded
**Mitigation**: Day.js timezone plugin is already configured in `nuxt.config.ts` and used throughout the application (see `ProfileBookingCard.vue`, `stores/bookedslots.ts`). No additional setup needed.

### Trade-off: Slightly More Complex Logic
**Benefit**: Prevents invalid bookings and improves user experience
**Cost**: Minimal - adds ~10 lines of code with clear logic

## Migration Plan

### Deployment Steps
1. Deploy code changes to staging environment
2. Test with various scenarios (see tasks.md section 2)
3. Deploy to production during low-traffic period
4. Monitor for any issues

### Rollback Plan
If issues arise, revert the commit. No database changes means instant rollback capability.

### User Communication
No user communication needed - this is a transparent improvement that prevents invalid actions.

## Open Questions

None - requirements are clear and implementation is straightforward.

