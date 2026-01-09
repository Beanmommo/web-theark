# booking-time-selection Specification

## ADDED Requirements

### Requirement: Sport Booking Availability Check

The system SHALL check if booking is enabled for a sport before displaying booking functionality.

#### Scenario: Booking enabled for sport

- **GIVEN** a sport has `websitePublishDate` set to a past date or is not configured
- **WHEN** a user accesses the booking page for that sport
- **THEN** the system SHALL display the normal booking interface
- **AND** allow users to select dates, times, and complete bookings

#### Scenario: Booking not yet enabled for sport

- **GIVEN** a sport has `websitePublishDate` set to a future date
- **WHEN** a user accesses the booking page for that sport
- **THEN** the system SHALL hide all booking forms
- **AND** display a "Coming Soon" message
- **AND** show the booking launch date if available
- **AND** prevent any booking actions

#### Scenario: Quick Booking section with booking disabled

- **GIVEN** a sport has booking disabled (future `websitePublishDate`)
- **WHEN** a user views the Quick Booking section on the sport page
- **THEN** the system SHALL replace the booking search form with a "Coming Soon" state
- **AND** display the booking launch date if configured
- **AND** optionally show a notification signup or call-to-action

