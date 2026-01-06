# credit-package-management Specification

## Purpose
TBD - created by archiving change add-sports-type-to-credit-packages. Update Purpose after archive.
## Requirements
### Requirement: Sports Type Filtering for Package Purchase

The system SHALL filter credit packages by sports type when displaying packages on the purchase page.

#### Scenario: Display Futsal packages on Futsal purchase page

- **GIVEN** a user navigates to `/futsal/packages`
- **WHEN** the package listing page renders
- **THEN** the system SHALL call `getPackagesBySport('futsal')`
- **AND** only packages with `typeOfSports` matching "futsal" (case-insensitive) SHALL be displayed
- **AND** packages without a `typeOfSports` field SHALL default to "futsal" for backward compatibility

#### Scenario: Display Pickleball packages on Pickleball purchase page

- **GIVEN** a user navigates to `/pickleball/packages`
- **WHEN** the package listing page renders
- **THEN** the system SHALL call `getPackagesBySport('pickleball')`
- **AND** only packages with `typeOfSports` matching "pickleball" (case-insensitive) SHALL be displayed

#### Scenario: No packages available for sport

- **GIVEN** a user navigates to a sport-specific package page
- **AND** no packages exist for that sport type
- **WHEN** the package listing page renders
- **THEN** the system SHALL display "Coming Soon" message
- **AND** no package cards SHALL be shown

### Requirement: Sports Type Filtering for Booking Payment

The system SHALL filter available credit packages by sports type when displaying payment options during booking checkout.

#### Scenario: Show only matching credit packages during Futsal booking

- **GIVEN** a user is completing a Futsal booking
- **AND** the user has credit packages for both Futsal and Pickleball
- **WHEN** the payment page displays available credits
- **THEN** only credit packages with `creditPackage.typeOfSports` matching "Futsal" SHALL be shown
- **AND** the total available credits SHALL only include matching packages

#### Scenario: Show only matching credit packages during Pickleball booking

- **GIVEN** a user is completing a Pickleball booking
- **AND** the user has credit packages for both Futsal and Pickleball
- **WHEN** the payment page displays available credits
- **THEN** only credit packages with `creditPackage.typeOfSports` matching "Pickleball" SHALL be shown
- **AND** the total available credits SHALL only include matching packages

#### Scenario: No matching credit packages available

- **GIVEN** a user is completing a booking for a specific sport
- **AND** the user has no credit packages matching that sport type
- **WHEN** the payment page displays available credits
- **THEN** the available credit balance SHALL show $0.00
- **AND** the credit payment option SHALL be disabled or hidden

### Requirement: Sports Type Validation for Credit Usage

The system SHALL validate that credit packages match the booking's sport type before allowing credit usage.

#### Scenario: Validate sport type match during credit payment

- **GIVEN** a user selects credit payment for a booking
- **WHEN** the system processes the credit usage via `recordUsage()`
- **THEN** the system SHALL verify each credit package's `typeOfSports` matches the booking's `typeOfSports`
- **AND** if any package does not match, the system SHALL reject the transaction with an error
- **AND** the error message SHALL indicate "Credit package sport type does not match booking"

#### Scenario: Allow credit usage for matching sport type

- **GIVEN** a user has Futsal credit packages
- **AND** the user is booking a Futsal court
- **WHEN** the system processes the credit payment
- **THEN** the system SHALL allow the credit usage
- **AND** the credit package balance SHALL be deducted accordingly

### Requirement: Sports Type Filtering in Admin Unpaid Booking Drawer

The system SHALL filter credit packages by sports type when displaying available credits in the admin unpaid booking drawer.

#### Scenario: Show sport-specific credits in admin drawer

- **GIVEN** an admin is processing an unpaid booking
- **AND** the booking contains time slots for a specific sport (e.g., Futsal)
- **WHEN** the unpaid booking drawer fetches customer credits
- **THEN** the system SHALL extract the sport type from `slotDetails[].typeOfSports`
- **AND** only credit packages matching that sport type SHALL be included in available credits
- **AND** the credit balance display SHALL show only sport-specific available credits

#### Scenario: Mixed sport slots in booking

- **GIVEN** an admin is processing an unpaid booking
- **AND** the booking contains slots for multiple sports (edge case)
- **WHEN** the unpaid booking drawer fetches customer credits
- **THEN** the system SHALL use the first slot's sport type for filtering
- **OR** the system SHALL show credits for all sports represented in the booking

### Requirement: Backward Compatibility for Legacy Packages

The system SHALL handle credit packages without a `typeOfSports` field by defaulting to "futsal" to ensure existing purchased credits remain usable.

#### Scenario: Purchased credit package without typeOfSports field

- **GIVEN** a user has purchased credit packages before sports type filtering was implemented
- **AND** these `CreditPackage` records do not have `creditPackage.typeOfSports` field
- **WHEN** the system filters packages by sport type
- **THEN** the package SHALL be treated as a "futsal" package
- **AND** the package SHALL appear in Futsal package listings and be usable for Futsal bookings
- **AND** the package SHALL NOT appear in Pickleball or other sport listings

#### Scenario: Legacy purchased package in mixed environment

- **GIVEN** a user has both old purchased packages (no `typeOfSports`) and new purchased packages (with `typeOfSports`)
- **WHEN** filtering packages for Futsal booking
- **THEN** both explicit Futsal packages and packages without `typeOfSports` SHALL be included
- **AND** packages with other sport types SHALL be excluded
- **AND** the total available credit balance SHALL include both old and new Futsal packages

#### Scenario: Legacy purchased package used for Futsal booking

- **GIVEN** a user has a purchased credit package without `typeOfSports` field
- **AND** the user is booking a Futsal court
- **WHEN** the system processes credit payment
- **THEN** the system SHALL allow the credit usage (defaulting to "futsal")
- **AND** the credit package balance SHALL be deducted accordingly
- **AND** no error SHALL be raised about missing sport type

#### Scenario: Legacy purchased package rejected for Pickleball booking

- **GIVEN** a user has a purchased credit package without `typeOfSports` field (defaults to "futsal")
- **AND** the user is booking a Pickleball court
- **WHEN** the system filters available credits
- **THEN** the package SHALL NOT be shown as available
- **AND** the user SHALL need to purchase Pickleball-specific credits

