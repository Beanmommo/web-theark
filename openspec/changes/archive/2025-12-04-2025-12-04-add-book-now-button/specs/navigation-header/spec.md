# Navigation Header Specification

## ADDED Requirements

### Requirement: Book Now Button in Desktop Navigation

The system SHALL display a prominent "Book Now" button in the desktop `MainAppBar` component when the user is viewing a sport-specific page.

#### Scenario: Display Book Now button on sport page

- **GIVEN** the user is on a sport-specific page (e.g., `/futsal`, `/futsal/venue`, `/futsal/booking`)
- **AND** the `sportSlug` parameter is present in the route
- **WHEN** the `MainAppBar` component renders
- **THEN** a "Book Now" button SHALL be displayed on the right side of the navigation bar
- **AND** the button SHALL be styled with the accent color to be visually distinct
- **AND** the button SHALL appear alongside the UserButton

#### Scenario: Hide Book Now button on home page

- **GIVEN** the user is on the home page (e.g., `/`)
- **AND** no `sportSlug` parameter is present in the route
- **WHEN** the `MainAppBar` component renders
- **THEN** the "Book Now" button SHALL NOT be displayed

#### Scenario: Book Now button navigation

- **GIVEN** the user is on `/futsal` or any futsal-related page
- **AND** the user clicks the "Book Now" button
- **WHEN** the click handler executes
- **THEN** the application SHALL navigate to `/{sportSlug}/booking`
- **AND** specifically `/futsal/booking` for futsal pages

#### Scenario: Book Now button with different sports

- **GIVEN** the user is on `/pickleball` or any pickleball-related page
- **AND** the user clicks the "Book Now" button
- **WHEN** the click handler executes
- **THEN** the application SHALL navigate to `/pickleball/booking`

### Requirement: Book Now Button in Mobile Navigation Menu

The system SHALL display a prominent "Book Now" button in the mobile `MainAppBarMobileMenu` component when the user is viewing a sport-specific page.

#### Scenario: Display Book Now button in mobile menu on sport page

- **GIVEN** the user is on a sport-specific page (e.g., `/futsal`, `/pickleball`)
- **AND** the `sportSlug` parameter is present in the route
- **AND** the mobile menu is open
- **WHEN** the `MainAppBarMobileMenu` component renders
- **THEN** a "Book Now" button SHALL be displayed in the mobile navigation menu
- **AND** the button SHALL be styled to match the mobile menu design
- **AND** the button SHALL be visually distinct from other navigation items

#### Scenario: Hide Book Now button in mobile menu on home page

- **GIVEN** the user is on the home page (e.g., `/`)
- **AND** no `sportSlug` parameter is present in the route
- **WHEN** the `MainAppBarMobileMenu` component renders
- **THEN** the "Book Now" button SHALL NOT be displayed

#### Scenario: Mobile Book Now button navigation and menu closure

- **GIVEN** the user is on `/futsal` or any futsal-related page
- **AND** the mobile menu is open
- **AND** the user clicks the "Book Now" button
- **WHEN** the click handler executes
- **THEN** the application SHALL navigate to `/{sportSlug}/booking`
- **AND** the mobile menu SHALL close automatically
- **AND** specifically navigates to `/futsal/booking` for futsal pages

#### Scenario: Mobile Book Now button with different sports

- **GIVEN** the user is on `/pickleball` or any pickleball-related page
- **AND** the mobile menu is open
- **AND** the user clicks the "Book Now" button
- **WHEN** the click handler executes
- **THEN** the application SHALL navigate to `/pickleball/booking`
- **AND** the mobile menu SHALL close

### Requirement: Consistent Conditional Rendering

The system SHALL apply consistent conditional rendering logic across both desktop and mobile navigation components for the Book Now button.

#### Scenario: Consistent appearance across components

- **GIVEN** a route with a defined `sportSlug` parameter
- **WHEN** both `MainAppBar` and `MainAppBarMobileMenu` render
- **THEN** both components SHALL display the "Book Now" button
- **AND** both buttons SHALL navigate to the same `/{sportSlug}/booking` route

#### Scenario: Consistent disappearance across components

- **GIVEN** a route without a defined `sportSlug` parameter (home page)
- **WHEN** both `MainAppBar` and `MainAppBarMobileMenu` render
- **THEN** neither component SHALL display the "Book Now" button
