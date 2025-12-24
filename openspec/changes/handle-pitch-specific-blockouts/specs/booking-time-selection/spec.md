# booking-time-selection Specification Delta

## ADDED Requirements

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

