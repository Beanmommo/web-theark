# Sports Configuration

## ADDED Requirements

### Requirement: Dynamic Sports Loading

The system SHALL load sports configuration dynamically from Firebase config instead of using hardcoded values.

#### Scenario: Sports loaded from Firebase

- **GIVEN** the application is initializing
- **WHEN** the sports store is created
- **THEN** the system SHALL fetch sports configuration from Firebase
- **AND** populate the sports array with configured sports

#### Scenario: Firebase config unavailable

- **GIVEN** Firebase config cannot be loaded
- **WHEN** the sports store attempts to fetch sports
- **THEN** the system SHALL handle the error gracefully
- **AND** log the error for debugging
- **AND** fall back to an empty sports array or cached data

### Requirement: Website Visibility Control

The system SHALL control sport visibility on the website based on `websiteStartDate` configuration.

#### Scenario: Sport not yet visible

- **GIVEN** a sport has `websiteStartDate` set to a future date
- **WHEN** a user accesses the website
- **THEN** the sport SHALL NOT appear in the sports list
- **AND** the sport page SHALL NOT be accessible via direct URL navigation
- **AND** the system SHALL return 404 for that sport's routes

#### Scenario: Sport becomes visible

- **GIVEN** a sport has `websiteStartDate` set to a past date
- **WHEN** a user accesses the website
- **THEN** the sport SHALL appear in the sports list
- **AND** the sport page SHALL be accessible via URL (e.g., `/pickleball`)
- **AND** users SHALL be able to view sport information

#### Scenario: Sport with no start date

- **GIVEN** a sport has no `websiteStartDate` configured
- **WHEN** the sport is marked as active
- **THEN** the sport SHALL be immediately visible on the website

### Requirement: Booking Availability Control

The system SHALL control booking availability based on `websitePublishDate` configuration.

#### Scenario: Booking not yet available

- **GIVEN** a sport has `websitePublishDate` set to a future date
- **WHEN** a user views the sport page or booking page
- **THEN** the system SHALL show a "Coming Soon" state
- **AND** hide all booking forms and functionality
- **AND** display the booking launch date if available

#### Scenario: Booking becomes available

- **GIVEN** a sport has `websitePublishDate` set to a past date
- **WHEN** a user views the sport page or booking page
- **THEN** the system SHALL show the normal booking interface
- **AND** allow users to search for available time slots
- **AND** enable the full booking flow

#### Scenario: Booking with no publish date

- **GIVEN** a sport has no `websitePublishDate` configured
- **WHEN** the sport is visible on the website
- **THEN** booking SHALL be immediately available

### Requirement: Coming Soon State - Quick Booking

The system SHALL display a "Coming Soon" state in the Quick Booking section when booking is not yet available.

#### Scenario: Quick Booking shows Coming Soon

- **GIVEN** a user is on a sport page where booking is not yet enabled
- **WHEN** they view the Quick Booking section
- **THEN** the system SHALL display a "Coming Soon" message
- **AND** show the booking launch date if configured
- **AND** hide the booking search form
- **AND** optionally show a call-to-action (e.g., "Notify Me")

#### Scenario: Quick Booking shows booking form

- **GIVEN** a user is on a sport page where booking is enabled
- **WHEN** they view the Quick Booking section
- **THEN** the system SHALL display the normal booking search form
- **AND** allow date and venue selection

### Requirement: Coming Soon State - Booking Page

The system SHALL display a "Coming Soon" banner on the booking page when accessed directly and booking is not yet available.

#### Scenario: Booking page shows Coming Soon

- **GIVEN** a user navigates directly to a booking URL (e.g., `/pickleball/booking`)
- **WHEN** booking is not yet enabled for that sport
- **THEN** the system SHALL display a prominent "Coming Soon" banner
- **AND** show the booking launch date if configured
- **AND** hide all booking forms (date picker, time slots, checkout)
- **AND** optionally show sport information or promotional content

#### Scenario: Booking page shows normal flow

- **GIVEN** a user navigates to a booking URL
- **WHEN** booking is enabled for that sport
- **THEN** the system SHALL display the normal booking flow
- **AND** allow users to select dates, times, and complete bookings

### Requirement: Sport Metadata Display

The system SHALL use sport metadata from Firebase config for consistent branding and display.

#### Scenario: Sport page rendering

- **GIVEN** a sport is configured with icon, theme, backgroundImage, tag, and startingRate
- **WHEN** a user views the sport page
- **THEN** the system SHALL apply the configured theme
- **AND** display the background image
- **AND** show the icon in navigation and headers
- **AND** display the tag and starting rate in promotional sections

### Requirement: Backward Compatibility

The system SHALL maintain compatibility with sports that lack scheduling configuration.

#### Scenario: Sport without scheduling dates

- **GIVEN** a sport exists in Firebase config without `websiteStartDate` or `websitePublishDate`
- **WHEN** the application loads the sport
- **THEN** the sport SHALL be immediately visible and bookable
- **AND** function exactly as it did before this feature was added

