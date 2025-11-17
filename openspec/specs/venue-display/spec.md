# venue-display Specification

## Purpose
TBD - created by archiving change update-sport-venue-card-image-selection. Update Purpose after archive.
## Requirements
### Requirement: Sport-Specific Venue Image Display

The system SHALL display sport-specific venue images in the `SportVenueCardItem` component based on the current sport context and available `sportsGalleries` data.

#### Scenario: Display sport-specific image when sportsGalleries exists

- **GIVEN** a venue has `sportsGalleries` data with entries for "Futsal" and "Pickleball"
- **AND** the user is viewing the Futsal venue listing page
- **WHEN** the `SportVenueCardItem` component renders
- **THEN** the component SHALL use the `public_id` from `sportsGalleries.Futsal`
- **AND** the image source SHALL be `website/{public_id}` where `{public_id}` is from the Futsal gallery

#### Scenario: Display sport-specific image for Pickleball

- **GIVEN** a venue has `sportsGalleries` data with entries for "Futsal" and "Pickleball"
- **AND** the user is viewing the Pickleball venue listing page
- **WHEN** the `SportVenueCardItem` component renders
- **THEN** the component SHALL use the `public_id` from `sportsGalleries.Pickleball`
- **AND** the image source SHALL be `website/{public_id}` where `{public_id}` is from the Pickleball gallery

#### Scenario: Fallback to legacy publicId when sportsGalleries is unavailable

- **GIVEN** a venue does NOT have `sportsGalleries` data
- **AND** the venue has a legacy `publicId` field
- **WHEN** the `SportVenueCardItem` component renders
- **THEN** the component SHALL use the legacy `publicId` field
- **AND** the image source SHALL be `website/{publicId}` as before

#### Scenario: Fallback when sport-specific gallery is missing

- **GIVEN** a venue has `sportsGalleries` data
- **AND** the `sportsGalleries` does NOT contain an entry for the current sport
- **WHEN** the `SportVenueCardItem` component renders
- **THEN** the component SHALL fall back to the legacy `publicId` field
- **AND** the image source SHALL be `website/{publicId}`

### Requirement: Type Safety for Sports Galleries

The system SHALL provide TypeScript type definitions for the `sportsGalleries` data structure to ensure type safety across the application.

#### Scenario: SportsGallery interface definition

- **GIVEN** the TypeScript type system
- **WHEN** defining venue data types
- **THEN** a `SportsGallery` interface SHALL exist with the following properties:
  - `gallery`: array of strings (image paths)
  - `public_id`: string (primary image identifier)

#### Scenario: SportsGalleries type definition

- **GIVEN** the TypeScript type system
- **WHEN** defining venue data types
- **THEN** a `SportsGalleries` type SHALL exist as a record mapping sport names to `SportsGallery` objects
- **AND** the type SHALL be defined as `Record<string, SportsGallery>`

#### Scenario: Venue interface includes sportsGalleries

- **GIVEN** the `Venue` interface in `types/data.ts`
- **WHEN** defining venue properties
- **THEN** the interface SHALL include an optional `sportsGalleries` field of type `SportsGalleries`
- **AND** the field SHALL be marked as optional to maintain backward compatibility

### Requirement: Sport Name Normalization

The system SHALL normalize sport slugs to capitalized sport names for consistent lookup in the `sportsGalleries` object.

#### Scenario: Convert sport slug to capitalized name

- **GIVEN** a sport slug of "futsal"
- **WHEN** looking up the sport-specific gallery
- **THEN** the system SHALL convert "futsal" to "Futsal"
- **AND** use "Futsal" as the key to access `sportsGalleries.Futsal`

#### Scenario: Convert pickleball slug to capitalized name

- **GIVEN** a sport slug of "pickleball"
- **WHEN** looking up the sport-specific gallery
- **THEN** the system SHALL convert "pickleball" to "Pickleball"
- **AND** use "Pickleball" as the key to access `sportsGalleries.Pickleball`

### Requirement: Sport-Specific Venue Carousel Images

The system SHALL display sport-specific carousel images in the `VenuePage` component based on the current sport context and available `sportsGalleries` data.

#### Scenario: Display sport-specific carousel for Futsal

- **GIVEN** a venue has `sportsGalleries` data with a Futsal gallery containing multiple images
- **AND** the user is viewing the Futsal venue detail page
- **WHEN** the `VenuePage` carousel renders
- **THEN** the carousel SHALL display images from `sportsGalleries.Futsal.gallery` array
- **AND** each image SHALL be properly formatted with Cloudinary URL

#### Scenario: Display sport-specific carousel for Pickleball

- **GIVEN** a venue has `sportsGalleries` data with a Pickleball gallery containing images
- **AND** the user is viewing the Pickleball venue detail page
- **WHEN** the `VenuePage` carousel renders
- **THEN** the carousel SHALL display images from `sportsGalleries.Pickleball.gallery` array
- **AND** each image SHALL be properly formatted with Cloudinary URL

#### Scenario: Fallback to legacy gallery when sportsGalleries unavailable

- **GIVEN** a venue does NOT have `sportsGalleries` data
- **AND** the venue has a legacy `gallery` array and `publicId`
- **WHEN** the `VenuePage` carousel renders
- **THEN** the carousel SHALL display the legacy `publicId` image first
- **AND** then display images from the legacy `gallery` array
- **AND** maintain the existing carousel behavior

#### Scenario: Fallback when sport-specific gallery is missing

- **GIVEN** a venue has `sportsGalleries` data
- **AND** the `sportsGalleries` does NOT contain a gallery for the current sport
- **WHEN** the `VenuePage` carousel renders
- **THEN** the carousel SHALL fall back to the legacy `publicId` and `gallery` fields
- **AND** display images as before the change

#### Scenario: Handle empty sport-specific gallery

- **GIVEN** a venue has `sportsGalleries` data for the current sport
- **AND** the sport-specific `gallery` array is empty
- **WHEN** the `VenuePage` carousel renders
- **THEN** the carousel SHALL fall back to the legacy `publicId` and `gallery` fields
- **AND** ensure at least one image is displayed

