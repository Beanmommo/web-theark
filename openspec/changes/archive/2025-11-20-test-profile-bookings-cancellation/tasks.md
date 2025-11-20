# Implementation Tasks

## 1. Investigation and Debugging

- [x] 1.1 Test profile page with a user account that has bookings
- [x] 1.2 Check browser console for any API errors when loading profile page
- [x] 1.3 Verify API endpoints `/api/bookings/[email]` and `/api/bookedslots/email/[email]` return data
- [x] 1.4 Check if bookings are being fetched but not displayed due to UI logic - **FIXED**
- [x] 1.5 Verify the condition `Object.keys(myBookedslots).length > 0` is being met - **FIXED: Removed incorrect condition**
- [x] 1.6 Test with different user accounts (with/without bookings)
- [x] 1.7 Check network tab to see if API calls are being made
- [x] 1.8 Verify data structure returned from API matches expected types

## 2. Booking Display Testing

- [ ] 2.1 Test upcoming bookings display with bookings scheduled for future dates
- [ ] 2.2 Test past bookings display with bookings from previous dates
- [ ] 2.3 Test edge case: user with no bookings
- [ ] 2.4 Test edge case: user with only upcoming bookings
- [ ] 2.5 Test edge case: user with only past bookings
- [ ] 2.6 Verify booking cards show correct information (location, date, sport, price, slots)
- [ ] 2.7 Test loading state displays correctly
- [ ] 2.8 Verify date filtering logic (Singapore timezone)

## 3. Booking Cancellation Testing

- [ ] 3.1 Test cancellation of a booking more than 72 hours before booking date
- [ ] 3.2 Test that cancellation is disabled for bookings within 72 hours
- [ ] 3.3 Verify cancellation confirmation dialog appears
- [ ] 3.4 Test cancellation workflow completes without errors
- [ ] 3.5 Verify booking is moved to cancelledBookings collection
- [ ] 3.6 Verify slots are moved to cancelledSlots collection
- [ ] 3.7 Verify slots are deleted from bookedSlots collection
- [ ] 3.8 Verify booking is deleted from bookings collection
- [ ] 3.9 Check that automate system slot deletion is called
- [ ] 3.10 Verify booking list refreshes after cancellation

## 4. Credit Refund Testing

- [ ] 4.1 Verify refund amount calculation (subtotal - discount)
- [ ] 4.2 Test that refund invoice is created with paymentMethod "Refund"
- [ ] 4.3 Verify credit refund is added to creditRefunds collection
- [ ] 4.4 Test that original invoice paymentMethod is updated to "Refund"
- [ ] 4.5 Verify credit refund has correct expiry date (based on package expiry period)
- [ ] 4.6 Test that refunded credits appear in user profile
- [ ] 4.7 Verify refund credits are separate from purchased credits
- [ ] 4.8 Test credit refund can be used for future bookings
- [ ] 4.9 Verify credit refund includes all required metadata (originalBookingKey, cancelledDate, etc.)

## 5. Bug Fixes (if issues found)

- [ ] 5.1 Fix any API endpoint issues
- [ ] 5.2 Fix any data fetching issues in stores
- [ ] 5.3 Fix any UI rendering issues in components
- [ ] 5.4 Fix any date/timezone handling issues
- [ ] 5.5 Fix any cancellation workflow issues
- [ ] 5.6 Fix any credit refund calculation issues
- [ ] 5.7 Add error handling where missing
- [ ] 5.8 Add loading states where missing

## 6. Profile Editing Implementation

- [x] 6.1 Add edit mode toggle to ProfileUserDetails component
- [x] 6.2 Create editable fields for display name and contact number
- [x] 6.3 Make email field read-only with explanation text
- [x] 6.4 Add validation for display name (required, non-empty)
- [x] 6.5 Add validation for contact number (valid phone format)
- [x] 6.6 Implement save functionality to update user profile
- [x] 6.7 Add loading state during profile update
- [x] 6.8 Display success message after successful update
- [x] 6.9 Display error message if update fails
- [ ] 6.10 Test profile update with Firebase Authentication API
- [ ] 6.11 Verify updated profile persists across sessions
- [ ] 6.12 Test that new bookings use updated profile information

## 7. Password Change Implementation

- [x] 7.1 Detect user sign-in provider (email vs Google)
- [x] 7.2 Add "Change Password" button for email sign-in users
- [x] 7.3 Hide password change option for Google sign-in users
- [x] 7.4 Implement password reset email trigger using Firebase Auth
- [ ] 7.5 Add confirmation dialog before sending reset email
- [x] 7.6 Display success message after reset email sent
- [x] 7.7 Handle errors (e.g., email not found, network issues)
- [ ] 7.8 Test password reset flow end-to-end
- [ ] 7.9 Verify reset email is received and link works
- [x] 7.10 Add informational text for Google users about account management

## 8. UI/UX Enhancements

- [ ] 8.1 Design edit/view mode toggle UI
- [ ] 8.2 Add edit icon or button to trigger edit mode
- [ ] 8.3 Style editable fields to distinguish from read-only
- [ ] 8.4 Add cancel button to discard changes
- [ ] 8.5 Implement form validation feedback (inline errors)
- [ ] 8.6 Add confirmation before discarding unsaved changes
- [ ] 8.7 Ensure responsive design for mobile devices
- [ ] 8.8 Add accessibility attributes (ARIA labels, etc.)
- [ ] 8.9 Test keyboard navigation for form fields

## 9. Custom Dialog and Alert Components

- [x] 9.1 Create ConfirmDialog component with Vuetify styling
- [x] 9.2 Create AlertSnackbar component for top notifications
- [x] 9.3 Create GlobalAlert component for app-wide alerts
- [x] 9.4 Create useAlert composable for easy alert management
- [x] 9.5 Add GlobalAlert to layouts/default.vue
- [x] 9.6 Update ProfileBookingCard to use ConfirmDialog instead of browser confirm()
- [x] 9.7 Update ProfileBookingCard to use useAlert instead of browser alert()
- [ ] 9.8 Test confirmation dialog shows correct booking details
- [ ] 9.9 Test success alert appears after successful cancellation
- [ ] 9.10 Test error alert appears when cancellation fails
- [ ] 9.11 Test alert auto-dismisses after timeout
- [ ] 9.12 Test alert can be manually closed
- [ ] 9.13 Verify mobile responsiveness of dialog and alerts
- [x] 9.14 Create documentation for using ConfirmDialog and AlertSnackbar (docs/DIALOG_ALERT_USAGE.md)

## 10. Documentation

- [ ] 10.1 Document test results and findings
- [ ] 10.2 Document any bugs found and fixes applied
- [ ] 10.3 Update spec with actual behavior
- [ ] 10.4 Create user guide for cancellation process (if needed)
- [ ] 10.5 Document profile editing feature
- [ ] 10.6 Document password change process for users
