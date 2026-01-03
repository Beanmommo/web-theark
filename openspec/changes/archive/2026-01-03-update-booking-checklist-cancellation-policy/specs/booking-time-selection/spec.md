# Booking Time Selection - Spec Delta

## ADDED Requirements

### Requirement: Conditional Checklist Display Based on Pitch Cancellation Policy

The booking form checklist SHALL conditionally display cancellation-related checkboxes based on whether the selected pitches allow cancellation, as configured in the admin portal.

#### Scenario: All selected pitches allow cancellation

- **GIVEN** a user has selected time slots for booking
- **AND** all selected slots belong to pitches with `allowCancellation: true` (or undefined)
- **WHEN** the booking form checklist is displayed on Page 3
- **THEN** the system SHALL display all three checkboxes:
  - Terms and conditions acceptance
  - 72-hour notice requirement for rescheduling
  - Inclement weather policy adherence
- **AND** the form SHALL require both the terms checkbox and the weather policy checkbox to be checked before submission

#### Scenario: All selected pitches do not allow cancellation

- **GIVEN** a user has selected time slots for booking
- **AND** all selected slots belong to pitches with `allowCancellation: false`
- **WHEN** the booking form checklist is displayed on Page 3
- **THEN** the system SHALL display only the terms and conditions checkbox
- **AND** the system SHALL hide the 72-hour rescheduling notice checkbox
- **AND** the system SHALL hide the inclement weather policy checkbox
- **AND** the form SHALL require only the terms checkbox to be checked before submission

#### Scenario: Mixed pitches with different cancellation policies

- **GIVEN** a user has selected time slots for booking
- **AND** at least one selected slot belongs to a pitch with `allowCancellation: false`
- **AND** other selected slots belong to pitches with `allowCancellation: true`
- **WHEN** the booking form checklist is displayed on Page 3
- **THEN** the system SHALL hide the cancellation-related checkboxes (conservative approach)
- **AND** the system SHALL display only the terms and conditions checkbox
- **AND** the form SHALL require only the terms checkbox to be checked before submission

#### Scenario: Pitch without allowCancellation property (backward compatibility)

- **GIVEN** a user has selected time slots for booking
- **AND** the selected slots belong to pitches that do not have the `allowCancellation` property defined
- **WHEN** the booking form checklist is displayed on Page 3
- **THEN** the system SHALL treat the pitches as allowing cancellation (default behavior)
- **AND** the system SHALL display all three checkboxes
- **AND** the form SHALL require both the terms checkbox and the weather policy checkbox to be checked before submission

#### Scenario: Pitch matching logic for cancellation policy lookup

- **GIVEN** a user has selected time slots for booking
- **WHEN** the system determines which pitches the slots belong to
- **THEN** the system SHALL match pitches by:
  - Location key (`locationKey`)
  - Pitch name (slot's `pitch` property matches pitch's `name` property)
  - Sport type (`typeOfSports`, case-insensitive comparison)
- **AND** if no matching pitch is found, the system SHALL default to allowing cancellation (show all checkboxes)

#### Scenario: Form validation adapts to visible checkboxes

- **GIVEN** the booking form checklist is displayed
- **WHEN** cancellation-related checkboxes are hidden (due to `allowCancellation: false`)
- **THEN** the form validation SHALL only check the terms checkbox
- **AND** the form SHALL emit `update(true)` when the terms checkbox is checked
- **AND** the form SHALL emit `update(false)` when the terms checkbox is unchecked

#### Scenario: Form validation with all checkboxes visible

- **GIVEN** the booking form checklist is displayed
- **AND** all three checkboxes are visible (pitches allow cancellation)
- **WHEN** the user interacts with the checkboxes
- **THEN** the form validation SHALL check both the terms checkbox AND the weather policy checkbox
- **AND** the form SHALL emit `update(true)` only when BOTH checkboxes are checked
- **AND** the form SHALL emit `update(false)` when either checkbox is unchecked

