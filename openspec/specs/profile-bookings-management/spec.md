# profile-bookings-management Specification

## Purpose
TBD - created by archiving change test-profile-bookings-cancellation. Update Purpose after archive.
## Requirements
### Requirement: User Bookings Display

The system SHALL display all user bookings on the profile page, separated into upcoming and past bookings based on the booking date in Singapore timezone.

#### Scenario: User with upcoming bookings

- **GIVEN** a user is logged in
- **AND** the user has bookings scheduled for future dates
- **WHEN** the user navigates to the profile page
- **THEN** the system SHALL fetch bookings from `/api/bookings/[email]`
- **AND** the system SHALL fetch booked slots from `/api/bookedslots/email/[email]`
- **AND** the system SHALL display upcoming bookings in the "Upcoming Bookings" section
- **AND** each booking SHALL show location, date, sport, price, and time slots

#### Scenario: User with past bookings

- **GIVEN** a user is logged in
- **AND** the user has bookings from previous dates
- **WHEN** the user clicks "View Past Bookings"
- **THEN** the system SHALL display past bookings in the "Past Bookings" section
- **AND** bookings SHALL be filtered where booking date is before today in Singapore timezone

#### Scenario: User with no bookings

- **GIVEN** a user is logged in
- **AND** the user has no bookings
- **WHEN** the user navigates to the profile page
- **THEN** the system SHALL display "No upcoming bookings" message
- **AND** the system SHALL NOT show a loading spinner indefinitely

#### Scenario: Loading state

- **GIVEN** a user is logged in
- **WHEN** the profile page is loading bookings data
- **THEN** the system SHALL display a loading spinner
- **AND** the loading spinner SHALL disappear once data is fetched

### Requirement: Booking Data Retrieval

The system SHALL retrieve booking data from both Firestore and Realtime Database (RTDB) and merge the results.

#### Scenario: Bookings in Firestore

- **GIVEN** a user has bookings stored in Firestore
- **WHEN** the system fetches bookings by email
- **THEN** the system SHALL query Firestore `bookings` collection
- **AND** the system SHALL return all bookings matching the user's email

#### Scenario: Bookings in RTDB

- **GIVEN** a user has bookings stored in RTDB
- **WHEN** the system fetches bookings by email
- **THEN** the system SHALL query RTDB `bookings` path
- **AND** the system SHALL return all bookings matching the user's email

#### Scenario: Bookings in both databases

- **GIVEN** a user has bookings in both Firestore and RTDB
- **WHEN** the system fetches bookings by email
- **THEN** the system SHALL merge results from both databases
- **AND** Firestore results SHALL take precedence for duplicate keys

### Requirement: Booking Cancellation Eligibility

The system SHALL allow users to cancel bookings only if the booking date is more than 72 hours in the future.

#### Scenario: Cancellable booking

- **GIVEN** a user has a booking scheduled for 5 days from now
- **WHEN** the user views the booking card
- **THEN** the system SHALL enable the "Cancel Booking" option
- **AND** the user SHALL be able to click "Cancel Booking"

#### Scenario: Non-cancellable booking within 72 hours

- **GIVEN** a user has a booking scheduled for 2 days from now
- **WHEN** the user views the booking card
- **THEN** the system SHALL disable the "Cancel Booking" option
- **AND** the system SHALL display a tooltip: "Cancellation is not allowed 72 hours before the booking date"

#### Scenario: Past booking

- **GIVEN** a user has a booking from a previous date
- **WHEN** the user views the booking card in past bookings
- **THEN** the system SHALL NOT display the "Cancel Booking" option

### Requirement: Booking Cancellation Workflow

The system SHALL execute a complete cancellation workflow when a user cancels a booking, including moving data to cancelled collections, deleting from active collections, and processing refunds.

#### Scenario: Successful booking cancellation

- **GIVEN** a user has a cancellable booking
- **WHEN** the user clicks "Cancel Booking" and confirms
- **THEN** the system SHALL move the booking to `cancelledBookings` collection with cancellation metadata
- **AND** the system SHALL move all associated slots to `cancelledSlots` collection
- **AND** the system SHALL delete the booking from `bookings` collection
- **AND** the system SHALL delete all associated slots from `bookedSlots` collection
- **AND** the system SHALL attempt to delete slots from the automate system
- **AND** the system SHALL create a refund invoice
- **AND** the system SHALL add credit refund to user's account
- **AND** the system SHALL refresh the bookings list
- **AND** the system SHALL display a success message

#### Scenario: Cancellation with automate system failure

- **GIVEN** a user cancels a booking
- **AND** the automate system deletion fails
- **WHEN** the cancellation workflow executes
- **THEN** the system SHALL continue with the cancellation process
- **AND** the system SHALL log the automate deletion failure
- **AND** the system SHALL still complete the refund process

### Requirement: Credit Refund Calculation

The system SHALL calculate refund amounts as the booking subtotal minus any discounts applied, and create a credit refund with appropriate expiry date.

#### Scenario: Refund amount calculation

- **GIVEN** a booking has subtotal of $100
- **AND** the booking has a discount of $10
- **WHEN** the booking is cancelled
- **THEN** the system SHALL calculate refund amount as $90 (subtotal - discount)
- **AND** the system SHALL create a credit refund for $90

#### Scenario: Refund with no discount

- **GIVEN** a booking has subtotal of $100
- **AND** the booking has no discount ($0)
- **WHEN** the booking is cancelled
- **THEN** the system SHALL calculate refund amount as $100
- **AND** the system SHALL create a credit refund for $100

#### Scenario: Credit refund expiry date

- **GIVEN** a booking is cancelled
- **AND** the credit package has an expiry period of 6 months
- **WHEN** the system creates the credit refund
- **THEN** the system SHALL set the expiry date to 6 months from the cancellation date
- **AND** the credit refund SHALL include the expiry date in the data

### Requirement: Credit Refund Invoice Creation

The system SHALL create a refund invoice and update the original invoice to reflect the refund.

#### Scenario: Refund invoice creation

- **GIVEN** a booking is cancelled
- **WHEN** the system processes the refund
- **THEN** the system SHALL create a new invoice with paymentMethod "Refund"
- **AND** the refund invoice SHALL include all booking details
- **AND** the refund invoice SHALL be linked to the credit refund

#### Scenario: Original invoice update

- **GIVEN** a booking with an associated invoice is cancelled
- **WHEN** the system processes the refund
- **THEN** the system SHALL update the original invoice's paymentMethod to "Refund"
- **AND** the system SHALL link the original invoice to the credit refund key
- **AND** the system SHALL link the original invoice to the original booking key

### Requirement: Credit Display in User Profile

The system SHALL display total credits, purchased credits, and refund credits separately in the user profile.

#### Scenario: Display credits breakdown

- **GIVEN** a user has $50 in purchased credits
- **AND** the user has $30 in refund credits
- **WHEN** the user views their profile
- **THEN** the system SHALL display total credits as $80
- **AND** the system SHALL display purchased credits as $50
- **AND** the system SHALL display refund credits as $30
- **AND** each credit type SHALL be visually distinguished with icons

#### Scenario: Credits after cancellation

- **GIVEN** a user cancels a booking worth $90
- **WHEN** the cancellation completes
- **AND** the user refreshes their profile
- **THEN** the system SHALL update the refund credits to include the $90 refund
- **AND** the system SHALL update the total credits accordingly

### Requirement: Error Handling and User Feedback

The system SHALL provide clear error messages and loading states during booking operations.

#### Scenario: Cancellation failure

- **GIVEN** a user attempts to cancel a booking
- **AND** the cancellation process fails due to a server error
- **WHEN** the error occurs
- **THEN** the system SHALL display an error message: "Failed to cancel booking. Please try again or contact support."
- **AND** the system SHALL log the error details
- **AND** the booking SHALL remain in the active bookings list

#### Scenario: Loading state during cancellation

- **GIVEN** a user clicks "Cancel Booking"
- **WHEN** the cancellation process is in progress
- **THEN** the system SHALL display a loading indicator
- **AND** the system SHALL prevent duplicate cancellation requests
- **AND** the loading indicator SHALL disappear when the process completes

#### Scenario: API fetch failure

- **GIVEN** the profile page attempts to fetch bookings
- **AND** the API request fails
- **WHEN** the error occurs
- **THEN** the system SHALL log the error
- **AND** the system SHALL display an appropriate error state to the user
- **AND** the system SHALL allow the user to retry

### Requirement: User Profile Information Update

The system SHALL allow users to update their display name and contact number, but SHALL NOT allow email changes as email is used to identify bookings.

#### Scenario: Update display name

- **GIVEN** a user is viewing their profile
- **WHEN** the user updates their display name
- **AND** submits the change
- **THEN** the system SHALL update the user's display name in the authentication system
- **AND** the system SHALL display a success message
- **AND** the updated name SHALL be reflected immediately in the profile

#### Scenario: Update contact number

- **GIVEN** a user is viewing their profile
- **WHEN** the user updates their contact number
- **AND** submits the change
- **THEN** the system SHALL update the user's phone number in the authentication system
- **AND** the system SHALL display a success message
- **AND** the updated contact SHALL be reflected immediately in the profile

#### Scenario: Email field is read-only

- **GIVEN** a user is viewing their profile
- **WHEN** the user views the email field
- **THEN** the system SHALL display the email as read-only text
- **AND** the system SHALL NOT provide an option to edit the email
- **AND** the system SHALL display a message explaining that email cannot be changed

#### Scenario: Validation for display name

- **GIVEN** a user attempts to update their display name
- **AND** the display name is empty or contains only whitespace
- **WHEN** the user submits the change
- **THEN** the system SHALL display a validation error
- **AND** the system SHALL NOT update the display name

#### Scenario: Validation for contact number

- **GIVEN** a user attempts to update their contact number
- **AND** the contact number is in an invalid format
- **WHEN** the user submits the change
- **THEN** the system SHALL display a validation error
- **AND** the system SHALL NOT update the contact number

### Requirement: Password Change for Email Sign-In Users

The system SHALL allow users who signed in with email/password to request a password change, but SHALL NOT show this option for Google sign-in users.

#### Scenario: Email sign-in user requests password change

- **GIVEN** a user signed in with email and password
- **WHEN** the user views their profile
- **THEN** the system SHALL display a "Change Password" button or link
- **AND** when clicked, the system SHALL send a password reset email
- **AND** the system SHALL display a confirmation message

#### Scenario: Google sign-in user views profile

- **GIVEN** a user signed in with Google
- **WHEN** the user views their profile
- **THEN** the system SHALL NOT display a "Change Password" option
- **AND** the system MAY display a message indicating the account is managed by Google

#### Scenario: Password reset email sent

- **GIVEN** an email sign-in user requests a password change
- **WHEN** the password reset is initiated
- **THEN** the system SHALL send a password reset email to the user's registered email
- **AND** the email SHALL contain a secure reset link
- **AND** the system SHALL display: "Password reset email sent. Please check your inbox."

#### Scenario: Determine sign-in method

- **GIVEN** a user is viewing their profile
- **WHEN** the system loads the profile page
- **THEN** the system SHALL determine the user's sign-in provider (email or Google)
- **AND** the system SHALL show or hide the password change option accordingly

### Requirement: Profile Update Persistence

The system SHALL persist profile updates across all user sessions and ensure consistency with booking records.

#### Scenario: Updated profile reflects in future bookings

- **GIVEN** a user updates their display name or contact number
- **WHEN** the user makes a new booking
- **THEN** the new booking SHALL use the updated display name and contact
- **AND** the booking confirmation SHALL show the updated information

#### Scenario: Existing bookings retain original information

- **GIVEN** a user has existing bookings
- **AND** the user updates their display name or contact number
- **WHEN** the user views their existing bookings
- **THEN** the existing bookings SHALL retain the original name and contact used at booking time
- **AND** the system SHALL NOT retroactively update historical booking records

#### Scenario: Profile updates across devices

- **GIVEN** a user updates their profile on one device
- **WHEN** the user logs in on another device
- **THEN** the system SHALL display the updated profile information
- **AND** all profile fields SHALL be synchronized across devices

