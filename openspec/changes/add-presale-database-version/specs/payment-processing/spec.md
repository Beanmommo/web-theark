# Payment Processing Specification - Delta

## ADDED Requirements

### Requirement: Database Version Tracking for Presales

The system SHALL include a `databaseVersion` field in presale data to indicate which database (Firebase Realtime Database or Firestore) contains the presale record.

#### Scenario: Create booking presale with Firestore database version

- **GIVEN** a user completes the booking form and proceeds to payment
- **WHEN** the system creates a new presale via `addPresale()` in `stores/presales.ts`
- **THEN** the presale data SHALL include `databaseVersion: 'firestore'`
- **AND** the presale SHALL be saved to Firestore via `server/api/presales/index.ts`
- **AND** the `databaseVersion` field SHALL be persisted in the Firestore document

#### Scenario: Create package presale with Firestore database version

- **GIVEN** a user purchases a credit package and proceeds to payment
- **WHEN** the system creates a new presale via `addPackagePresale()` in `stores/presales.ts`
- **THEN** the presale data SHALL include `databaseVersion: 'firestore'`
- **AND** the presale SHALL be saved to Firestore via `server/api/presales/index.ts`
- **AND** the `databaseVersion` field SHALL be persisted in the Firestore document

#### Scenario: Include database version in Stripe payment metadata

- **GIVEN** a presale with `databaseVersion: 'firestore'`
- **WHEN** the system creates a Stripe payment intent via `server/api/stripe/secret.post.ts`
- **THEN** the payment intent metadata SHALL include `databaseVersion: 'firestore'`
- **AND** the payment server SHALL receive this metadata in the webhook
- **AND** the payment server SHALL use this value to determine which database to query

#### Scenario: Backward compatibility with presales without database version

- **GIVEN** an existing presale in RTDB without a `databaseVersion` field
- **WHEN** the payment server processes the payment
- **THEN** the payment server SHALL default to querying RTDB
- **AND** the payment SHALL be processed successfully
- **AND** no errors SHALL occur due to missing `databaseVersion` field

### Requirement: Database Version Type Safety

The system SHALL provide TypeScript type definitions for the `databaseVersion` field to ensure type safety and prevent invalid values.

#### Scenario: DatabaseVersion type definition

- **GIVEN** the TypeScript type system
- **WHEN** defining payment data types in `types/data.ts`
- **THEN** a `DatabaseVersion` type SHALL exist as a union type: `'rtdb' | 'firestore'`
- **AND** the type SHALL only allow these two string literal values

#### Scenario: Presale type includes optional databaseVersion

- **GIVEN** the `Presale` type in `types/data.ts`
- **WHEN** defining presale properties
- **THEN** the type SHALL include an optional `databaseVersion` field of type `DatabaseVersion`
- **AND** the field SHALL be marked as optional with `?` to maintain backward compatibility

#### Scenario: Invoice type includes optional databaseVersion

- **GIVEN** the `Invoice` type in `types/data.ts`
- **WHEN** defining invoice properties
- **THEN** the type SHALL include an optional `databaseVersion` field of type `DatabaseVersion`
- **AND** the field SHALL be marked as optional with `?` for consistency with presales

### Requirement: Database Version Validation

The system SHALL validate the `databaseVersion` field when creating payment intents to ensure data integrity.

#### Scenario: Validate databaseVersion in payment intent creation

- **GIVEN** a request to create a Stripe payment intent
- **WHEN** the request body is validated in `server/api/stripe/secret.post.ts`
- **THEN** if `databaseVersion` is present, it SHALL be a string
- **AND** if `databaseVersion` is present, it SHALL be either 'rtdb' or 'firestore'
- **AND** if `databaseVersion` is invalid, the request SHALL be rejected with a 400 error

#### Scenario: Allow missing databaseVersion for backward compatibility

- **GIVEN** a request to create a Stripe payment intent
- **WHEN** the request body does not include `databaseVersion`
- **THEN** the validation SHALL pass
- **AND** the payment intent SHALL be created without `databaseVersion` in metadata
- **AND** the payment server SHALL default to RTDB when processing the payment

### Requirement: Database Version Persistence

The system SHALL persist the `databaseVersion` field throughout the payment lifecycle from presale to invoice.

#### Scenario: Presale to invoice database version propagation

- **GIVEN** a presale with `databaseVersion: 'firestore'`
- **WHEN** the payment is completed and an invoice is created
- **THEN** the invoice SHALL include `databaseVersion: 'firestore'`
- **AND** the invoice SHALL be saved to Firestore with the `databaseVersion` field
- **AND** the database version SHALL remain consistent from presale to invoice

#### Scenario: Credit card payment preserves database version

- **GIVEN** a presale with `databaseVersion: 'firestore'`
- **WHEN** the user completes payment via credit card
- **THEN** the created invoice SHALL include `databaseVersion: 'firestore'`
- **AND** the invoice SHALL be retrievable from Firestore using the database version

#### Scenario: PayNow payment preserves database version

- **GIVEN** a presale with `databaseVersion: 'firestore'`
- **WHEN** the user completes payment via PayNow
- **THEN** the created invoice SHALL include `databaseVersion: 'firestore'`
- **AND** the invoice SHALL be retrievable from Firestore using the database version

