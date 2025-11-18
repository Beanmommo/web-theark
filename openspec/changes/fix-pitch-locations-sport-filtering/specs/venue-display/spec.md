# Venue Display Specification Delta

## ADDED Requirements

### Requirement: Active Pitch Filtering for Sport Venues

The system SHALL filter venues by active pitch status when retrieving sport-specific venues.

#### Scenario: Venue with active pitches for sport is included

- **GIVEN** a venue has at least one pitch with `active: true` for a specific sport
- **WHEN** retrieving venues for that sport using `getSportVenues(sportSlug)`
- **THEN** the venue SHALL be included in the results

#### Scenario: Venue with only inactive pitches for sport is excluded

- **GIVEN** a venue has pitches for a specific sport but all have `active: false`
- **WHEN** retrieving venues for that sport using `getSportVenues(sportSlug)`
- **THEN** the venue SHALL NOT be included in the results

#### Scenario: Venue with no pitches for sport is excluded

- **GIVEN** a venue has no pitches matching the specified sport type
- **WHEN** retrieving venues for that sport using `getSportVenues(sportSlug)`
- **THEN** the venue SHALL NOT be included in the results

#### Scenario: Venue with mixed active and inactive pitches is included

- **GIVEN** a venue has both active and inactive pitches for a specific sport
- **WHEN** retrieving venues for that sport using `getSportVenues(sportSlug)`
- **THEN** the venue SHALL be included in the results (because at least one pitch is active)

### Requirement: Active Pitch Filtering for Sport Pitches

The system SHALL filter pitches by active status when retrieving sport-specific pitches.

#### Scenario: Active pitch for sport is included

- **GIVEN** a pitch has `active: true` and matches the sport type
- **WHEN** retrieving pitches for that sport using `getSportPitches(sportSlug)`
- **THEN** the pitch SHALL be included in the results

#### Scenario: Inactive pitch for sport is excluded

- **GIVEN** a pitch has `active: false` and matches the sport type
- **WHEN** retrieving pitches for that sport using `getSportPitches(sportSlug)`
- **THEN** the pitch SHALL NOT be included in the results

### Requirement: Contact Page Venue Display

The system SHALL display only venues with active pitches for the specified sport on contact pages.

#### Scenario: Sport-specific contact page shows filtered venues

- **GIVEN** a user navigates to `/[sportSlug]/contactus`
- **WHEN** the page renders the venue locations section
- **THEN** only venues with at least one active pitch for that sport SHALL be displayed

#### Scenario: General contact page shows all active venues

- **GIVEN** a user navigates to `/contactus` (no sport slug)
- **WHEN** the page renders the venue locations section
- **THEN** all active venues SHALL be displayed regardless of sport

#### Scenario: Venue address is displayed correctly

- **GIVEN** a venue is included in the filtered results
- **WHEN** the venue is rendered in the locations section
- **THEN** the venue name and address SHALL be displayed

### Requirement: Backward Compatibility with Null Sport Types

The system SHALL maintain backward compatibility with pitches that have null `typeOfSports` values.

#### Scenario: Null typeOfSports is treated as futsal

- **GIVEN** a pitch has `typeOfSports: null` and `active: true`
- **WHEN** retrieving venues for "futsal" sport
- **THEN** the pitch SHALL be included in the filtering logic
- **AND** the venue containing this pitch SHALL be included if no other active pitches exist

#### Scenario: Null typeOfSports is excluded for non-futsal sports

- **GIVEN** a pitch has `typeOfSports: null` and `active: true`
- **WHEN** retrieving venues for "pickleball" sport
- **THEN** the pitch SHALL NOT be included in the filtering logic

