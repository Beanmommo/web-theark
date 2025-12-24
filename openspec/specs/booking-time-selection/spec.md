# booking-time-selection Specification

## Purpose
TBD - created by archiving change add-singapore-timezone-slot-filtering. Update Purpose after archive.
## Requirements
### Requirement: Singapore Timezone-Based Current Time Reference

The system SHALL use Singapore timezone (Asia/Singapore) as the reference timezone for determining the current time, regardless of the user's geographic location or browser timezone.

#### Scenario: User in different timezone accesses booking form

- **GIVEN** a user is accessing the booking form from Australia at 1:00 PM AEDT
- **AND** the current Singapore time is 10:00 AM SGT
- **WHEN** the system determines the current time for slot filtering
- **THEN** the system SHALL use 10:00 AM SGT as the current time reference

#### Scenario: User in Singapore accesses booking form

- **GIVEN** a user is accessing the booking form from Singapore at 10:00 AM SGT
- **WHEN** the system determines the current time for slot filtering
- **THEN** the system SHALL use 10:00 AM SGT as the current time reference

### Requirement: One-Hour Minimum Booking Buffer for Today's Slots

The system SHALL filter out time slots that start less than 1 hour from the current Singapore time when the selected booking date is today (in Singapore timezone).

#### Scenario: Booking for today with slots in the past

- **GIVEN** the current Singapore time is 10:00 AM SGT
- **AND** the user selects today's date for booking
- **AND** available time slots exist at 9:00 AM, 10:00 AM, 11:00 AM, 12:00 PM
- **WHEN** the system generates the list of available time slots
- **THEN** the system SHALL exclude the 9:00 AM slot (already passed)
- **AND** the system SHALL exclude the 10:00 AM slot (less than 1 hour away)
- **AND** the system SHALL include the 11:00 AM slot (exactly 1 hour away)
- **AND** the system SHALL include the 12:00 PM slot (more than 1 hour away)

#### Scenario: Booking for today late in the day

- **GIVEN** the current Singapore time is 11:30 PM SGT
- **AND** the user selects today's date for booking
- **AND** available time slots exist at 10:00 PM, 11:00 PM, 12:00 AM (midnight)
- **WHEN** the system generates the list of available time slots
- **THEN** the system SHALL exclude the 10:00 PM slot (already passed)
- **AND** the system SHALL exclude the 11:00 PM slot (already passed)
- **AND** the system SHALL exclude the 12:00 AM slot (belongs to next day)

#### Scenario: Multi-hour slot filtering

- **GIVEN** the current Singapore time is 9:30 AM SGT
- **AND** the user selects today's date for booking
- **AND** a 2-hour time slot exists from 10:00 AM to 12:00 PM
- **WHEN** the system generates the list of available time slots
- **THEN** the system SHALL exclude the 10:00 AM - 12:00 PM slot (starts less than 1 hour from now)

#### Scenario: Multi-hour slot that meets minimum buffer

- **GIVEN** the current Singapore time is 9:00 AM SGT
- **AND** the user selects today's date for booking
- **AND** a 2-hour time slot exists from 10:00 AM to 12:00 PM
- **WHEN** the system generates the list of available time slots
- **THEN** the system SHALL include the 10:00 AM - 12:00 PM slot (starts exactly 1 hour from now)

### Requirement: No Time Filtering for Future Dates

The system SHALL NOT apply time-based filtering for dates that are in the future (not today in Singapore timezone).

#### Scenario: Booking for tomorrow

- **GIVEN** the current Singapore time is 11:00 PM SGT on Monday
- **AND** the user selects Tuesday (tomorrow) for booking
- **AND** available time slots exist at 9:00 AM, 10:00 AM, 11:00 AM on Tuesday
- **WHEN** the system generates the list of available time slots
- **THEN** the system SHALL include all configured time slots for Tuesday
- **AND** the system SHALL NOT apply the 1-hour minimum buffer filter

#### Scenario: Booking for next week

- **GIVEN** the current Singapore time is 2:00 PM SGT
- **AND** the user selects a date 7 days in the future
- **AND** available time slots exist at 9:00 AM, 10:00 AM, 11:00 AM
- **WHEN** the system generates the list of available time slots
- **THEN** the system SHALL include all configured time slots
- **AND** the system SHALL NOT apply the 1-hour minimum buffer filter

### Requirement: Preserve Existing Filtering Logic

The system SHALL apply time-based filtering in addition to existing filtering logic for holidays, sports, and date ranges.

#### Scenario: Holiday slot filtering with time filtering

- **GIVEN** the current Singapore time is 10:00 AM SGT
- **AND** today is a public holiday
- **AND** the user selects today's date for booking
- **AND** holiday time slots exist at 9:00 AM, 11:00 AM, 1:00 PM
- **AND** the selected sport is "futsal"
- **WHEN** the system generates the list of available time slots
- **THEN** the system SHALL first filter for holiday slots matching "futsal"
- **AND** the system SHALL then apply time-based filtering
- **AND** the system SHALL exclude the 9:00 AM slot (already passed)
- **AND** the system SHALL include the 11:00 AM and 1:00 PM slots

#### Scenario: Sport-specific filtering with time filtering

- **GIVEN** the current Singapore time is 10:00 AM SGT
- **AND** the user selects today's date for booking
- **AND** the selected sport is "pickleball"
- **AND** time slots exist for both "futsal" and "pickleball" at 11:00 AM
- **WHEN** the system generates the list of available time slots
- **THEN** the system SHALL first filter for "pickleball" slots
- **AND** the system SHALL then apply time-based filtering
- **AND** the system SHALL only include "pickleball" slots that start at or after 11:00 AM

### Requirement: Time Slot Display Format Unchanged

The system SHALL display time slots in the configured format without timezone conversion or adjustment.

#### Scenario: Display format for filtered slots

- **GIVEN** the current Singapore time is 10:00 AM SGT
- **AND** the user selects today's date for booking
- **AND** available time slots exist at 11:00 AM, 12:00 PM, 1:00 PM
- **WHEN** the system displays the available time slots
- **THEN** the system SHALL display slots as "11am", "12pm", "1pm" (or configured format)
- **AND** the system SHALL NOT display timezone indicators (e.g., "11am SGT")
- **AND** the system SHALL NOT convert times to user's local timezone

### Requirement: Blockout-Based Slot Disabling

The system SHALL prevent users from selecting time slots that are blocked by active blockouts, while keeping pitch columns visible in the booking grid.

#### Scenario: Location-wide blockout blocks all pitches

- **GIVEN** a location-wide blockout exists for "Venue A" from 2025-01-15 to 2025-01-20
- **AND** the blockout has `targetSpecificPitches = false` (or undefined)
- **AND** user selects "Venue A" and date 2025-01-17 for booking
- **WHEN** the booking grid is displayed
- **THEN** all pitch columns SHALL remain visible
- **AND** all time slots for all pitches SHALL be marked as blocked
- **AND** blocked slots SHALL display a distinct visual indicator (e.g., gray blocked icon)
- **AND** blocked slots SHALL NOT be clickable

#### Scenario: Pitch-specific blockout blocks only targeted pitches

- **GIVEN** a pitch-specific blockout exists for "Venue A" from 2025-01-15 to 2025-01-20
- **AND** the blockout has `targetSpecificPitches = true`
- **AND** the blockout targets pitches ["1", "2"] (Pitch 1 and Pitch 2)
- **AND** "Venue A" has 4 pitches total
- **AND** user selects "Venue A" and date 2025-01-17 for booking
- **WHEN** the booking grid is displayed
- **THEN** all 4 pitch columns SHALL remain visible
- **AND** time slots for Pitch 1 and Pitch 2 SHALL be marked as blocked
- **AND** time slots for Pitch 3 and Pitch 4 SHALL remain selectable (if not booked)

#### Scenario: Auto-release days releases slots early

- **GIVEN** a blockout exists for "Venue A" from 2025-01-15 to 2025-01-20
- **AND** the blockout has `autoReleaseDays = 3`
- **AND** user selects "Venue A" and date 2025-01-18 for booking
- **WHEN** the system calculates the effective end date
- **THEN** effective end date SHALL be 2025-01-17 (3 days before 2025-01-20)
- **AND** slots on 2025-01-18 SHALL NOT be blocked (auto-released)
- **AND** slots on 2025-01-17 SHALL be blocked (last day of effective blockout)

#### Scenario: Multiple overlapping blockouts

- **GIVEN** a location-wide blockout exists for "Venue A" from 2025-01-15 to 2025-01-17
- **AND** a pitch-specific blockout exists for "Venue A" Pitch 1 from 2025-01-16 to 2025-01-20
- **AND** user selects "Venue A" and date 2025-01-16 for booking
- **WHEN** the booking grid is displayed
- **THEN** all pitches SHALL be blocked on 2025-01-16 (location-wide blockout applies)
- **WHEN** user selects date 2025-01-18
- **THEN** only Pitch 1 SHALL be blocked (pitch-specific blockout applies)
- **AND** other pitches SHALL remain selectable

#### Scenario: Blockout does not affect other locations

- **GIVEN** a blockout exists for "Venue A" from 2025-01-15 to 2025-01-20
- **AND** user selects "Venue B" and date 2025-01-17 for booking
- **WHEN** the booking grid is displayed
- **THEN** no slots SHALL be blocked due to the "Venue A" blockout
- **AND** all slots SHALL be selectable (if not booked)

### Requirement: Visual Distinction for Blocked Slots

The system SHALL provide clear visual feedback to distinguish blocked slots from booked slots and available slots.

#### Scenario: Blocked slot visual indicator

- **GIVEN** a slot is blocked by a blockout
- **WHEN** the booking grid is rendered
- **THEN** the blocked slot SHALL display a gray icon (e.g., `mdi-block-helper` or `mdi-cancel`)
- **AND** the icon color SHALL be distinct from booked slots (red) and available slots (gray/green)
- **AND** the slot SHALL NOT have a clickable cursor

#### Scenario: Tooltip explains blockout

- **GIVEN** a slot is blocked by a blockout
- **WHEN** user hovers over the blocked slot
- **THEN** a tooltip SHALL appear
- **AND** the tooltip SHALL display "Blocked" or "Unavailable due to blockout"

#### Scenario: Booked slot remains distinct

- **GIVEN** a slot is booked (not blocked)
- **WHEN** the booking grid is rendered
- **THEN** the booked slot SHALL display a red close icon (`mdi-close-circle`)
- **AND** the visual SHALL be clearly different from blocked slots

### Requirement: Backward Compatibility with Legacy Blockouts

The system SHALL handle blockouts without the new optional fields (`targetSpecificPitches`, `targetPitches`, `autoReleaseDays`) as location-wide blockouts with no auto-release.

#### Scenario: Legacy blockout without new fields

- **GIVEN** a blockout exists with only `location`, `startDate`, and `endDate` fields
- **AND** the blockout does NOT have `targetSpecificPitches`, `targetPitches`, or `autoReleaseDays` fields
- **WHEN** the system evaluates the blockout
- **THEN** the system SHALL treat it as a location-wide blockout (`targetSpecificPitches = false`)
- **AND** the system SHALL use `autoReleaseDays = 0` (no early release)
- **AND** all pitches at the location SHALL be blocked during the date range

#### Scenario: Blockout with missing autoReleaseDays

- **GIVEN** a blockout exists with `targetSpecificPitches = true` and `targetPitches = ["1"]`
- **AND** the blockout does NOT have `autoReleaseDays` field
- **WHEN** the system calculates the effective end date
- **THEN** the system SHALL use `autoReleaseDays = 0`
- **AND** the blockout SHALL be active until the end date (inclusive)

### Requirement: Pitch Matching Logic

The system SHALL correctly match pitch identifiers between blockouts and booking slots, handling both new format (pitch.id) and legacy format (pitch.name or "Pitch X").

#### Scenario: Pitch ID matching

- **GIVEN** a blockout targets pitch with ID "1"
- **AND** a booking slot has pitch.id = "1"
- **WHEN** the system checks if the slot is blocked
- **THEN** the system SHALL identify a match
- **AND** the slot SHALL be marked as blocked

#### Scenario: Legacy pitch name matching

- **GIVEN** a blockout targets pitch "Pitch 1"
- **AND** a booking slot has pitch.name = "1" or pitch.id = "1"
- **WHEN** the system checks if the slot is blocked
- **THEN** the system SHALL identify a match (extract number from "Pitch 1")
- **AND** the slot SHALL be marked as blocked

