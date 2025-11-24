# Promo Code Validation

## ADDED Requirements

### Requirement: Promo Code Data Model

The system SHALL support promo codes with the following fields:

- `key`: Unique identifier
- `name`: Display name of the promo code
- `promocode`: The actual code string users enter
- `locations`: Array of location IDs where the promo code is valid
- `startDate`: Start date of promo code validity (YYYY-MM-DD format)
- `validTill`: End date of promo code validity (YYYY-MM-DD format)
- `publishStart`: Start date when promo code becomes visible/applicable (YYYY-MM-DD format)
- `publishEnd`: End date when promo code stops being visible/applicable (YYYY-MM-DD format)
- `timeslotTypes`: Array of timeslot types (e.g., "Off-Peak", "Peak") the promo applies to
- `type`: Discount type ("Percentage", "Amount", or "Session")
- `value`: Discount value (percentage number, fixed amount, or per-session amount)
- `targetPitches`: (Optional) Array of pitch IDs the promo code targets
- `targetSpecificPitches`: (Optional) Boolean flag to enable pitch-specific targeting
- `typeOfSports`: (Optional) Array of sport types (e.g., "Pickleball", "Futsal") the promo applies to

#### Scenario: Promo code with all fields

- **WHEN** a promo code is created with location, pitch, and sport targeting
- **THEN** the system SHALL store all fields including `targetPitches`, `targetSpecificPitches`, and `typeOfSports`

#### Scenario: Promo code without optional fields (backward compatibility)

- **WHEN** a promo code exists without `targetPitches`, `targetSpecificPitches`, or `typeOfSports` fields
- **THEN** the system SHALL treat it as valid and apply it based on location and timeslot type only

### Requirement: Location-Based Validation

The system SHALL validate that a promo code's location matches the booking location.

#### Scenario: Valid location match

- **WHEN** a user applies a promo code
- **AND** the booking location is in the promo code's `locations` array
- **THEN** the location validation SHALL pass

#### Scenario: Invalid location match

- **WHEN** a user applies a promo code
- **AND** the booking location is NOT in the promo code's `locations` array
- **THEN** the promo code SHALL be rejected with an error message

### Requirement: Date-Based Validation

The system SHALL validate that the current date and booking date fall within the promo code's validity period.

#### Scenario: Valid publish period

- **WHEN** a user applies a promo code
- **AND** the current date is on or after `publishStart`
- **AND** the current date is before `publishEnd`
- **THEN** the publish period validation SHALL pass

#### Scenario: Invalid publish period

- **WHEN** a user applies a promo code
- **AND** the current date is before `publishStart` OR on or after `publishEnd`
- **THEN** the promo code SHALL be rejected with an error message

#### Scenario: Valid booking date

- **WHEN** a user applies a promo code
- **AND** the booking date is on or after `startDate`
- **AND** the booking date is on or before `validTill`
- **THEN** the booking date validation SHALL pass

#### Scenario: Invalid booking date

- **WHEN** a user applies a promo code
- **AND** the booking date is before `startDate` OR after `validTill`
- **THEN** the promo code SHALL be rejected with an error message

### Requirement: Pitch-Based Validation

The system SHALL validate that selected timeslots match the targeted pitches when pitch targeting is enabled.

#### Scenario: Pitch targeting enabled with matching pitches

- **WHEN** a user applies a promo code with `targetSpecificPitches` set to true
- **AND** the promo code has `targetPitches` array with specific pitch IDs
- **AND** all selected timeslots are for pitches in the `targetPitches` array
- **THEN** the pitch validation SHALL pass

#### Scenario: Pitch targeting enabled with non-matching pitches

- **WHEN** a user applies a promo code with `targetSpecificPitches` set to true
- **AND** the promo code has `targetPitches` array with specific pitch IDs
- **AND** any selected timeslot is for a pitch NOT in the `targetPitches` array
- **THEN** the promo code SHALL be rejected with an error message

#### Scenario: Pitch targeting disabled

- **WHEN** a user applies a promo code with `targetSpecificPitches` set to false or undefined
- **THEN** the system SHALL skip pitch validation and accept any pitch

### Requirement: Sport Type Validation

The system SHALL validate that selected timeslots match the targeted sport types when sport type targeting is configured.

#### Scenario: Sport type targeting with matching sport

- **WHEN** a user applies a promo code with `typeOfSports` array containing specific sport types
- **AND** all selected timeslots are for sports in the `typeOfSports` array
- **THEN** the sport type validation SHALL pass

#### Scenario: Sport type targeting with non-matching sport

- **WHEN** a user applies a promo code with `typeOfSports` array containing specific sport types
- **AND** any selected timeslot is for a sport NOT in the `typeOfSports` array
- **THEN** the promo code SHALL be rejected with an error message

#### Scenario: No sport type targeting (backward compatibility)

- **WHEN** a user applies a promo code without `typeOfSports` field or with an empty array
- **THEN** the system SHALL skip sport type validation and accept any sport

### Requirement: Discount Calculation with Targeting

The system SHALL calculate discounts only for timeslots that match all targeting criteria.

#### Scenario: Percentage discount with pitch targeting

- **WHEN** a promo code with type "Percentage" and pitch targeting is applied
- **AND** some timeslots match the targeted pitches and some don't
- **THEN** the discount SHALL only apply to timeslots matching the targeted pitches

#### Scenario: Amount discount with sport type targeting

- **WHEN** a promo code with type "Amount" and sport type targeting is applied
- **AND** some timeslots match the targeted sport types and some don't
- **THEN** the discount SHALL only apply once if any timeslot matches the criteria

#### Scenario: Session discount with combined targeting

- **WHEN** a promo code with type "Session" and both pitch and sport targeting is applied
- **AND** timeslots match both pitch and sport criteria
- **THEN** the discount SHALL apply per session for matching timeslots only

