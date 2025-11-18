# Booking Time Selection Specification

## ADDED Requirements

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

