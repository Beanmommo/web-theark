# Test Profile Bookings and Cancellation Proposal

## Why

The profile page is currently experiencing issues where bookings are not displaying properly. Additionally, the booking cancellation functionality and credit refund mechanism need to be thoroughly tested to ensure they work correctly. This is critical for user experience as users need to:

1. View their upcoming and past bookings
2. Cancel bookings when needed
3. Receive proper credit refunds upon cancellation

## What Changes

This proposal outlines a comprehensive testing plan to verify and fix the profile page functionality, plus add user account management features:

- **Test booking display**: Verify that upcoming and past bookings are fetched and displayed correctly
- **Test booking data flow**: Ensure bookings and booked slots are properly retrieved from both Firestore and RTDB
- **Test cancellation workflow**: Verify the complete cancellation process including:
  - Moving bookings to cancelledBookings collection
  - Moving slots to cancelledSlots collection
  - Deleting from automate system
  - Creating refund invoices
  - Adding credit refunds to user account
- **Test credit refund calculation**: Ensure refund amounts are calculated correctly (subtotal - discount)
- **Test credit display**: Verify that refunded credits appear in the user's profile
- **Identify and fix root causes**: Debug why bookings are not showing and fix any issues found
- **Add profile editing**: Allow users to update display name and contact number
- **Add password change**: Enable email sign-in users to request password reset (not for Google sign-in users)
- **Email protection**: Prevent email changes as email is used to identify bookings
- **Replace browser dialogs**: Create custom confirmation dialog and alert snackbar components to replace native browser `confirm()` and `alert()` calls

## Impact

- **Affected specs**: This will create a new spec for `profile-bookings-management`
- **Affected code**:
  - `pages/profile.vue` - Main profile page
  - `components/ProfileUpcomingBookings.vue` - Upcoming bookings display
  - `components/ProfilePastBookings.vue` - Past bookings display
  - `components/ProfileBookingCard.vue` - Individual booking card with cancellation
  - `components/ProfileUserDetails.vue` - User details and credit display
  - `components/ConfirmDialog.vue` - **NEW**: Custom confirmation dialog component
  - `components/AlertSnackbar.vue` - **NEW**: Custom alert snackbar component
  - `components/GlobalAlert.vue` - **NEW**: Global alert wrapper component
  - `composables/useAlert.ts` - **NEW**: Composable for global alerts
  - `layouts/default.vue` - Added GlobalAlert component
  - `stores/bookings.ts` - Booking store with fetchMyBookings and cancelBooking
  - `stores/bookedslots.ts` - Booked slots store with fetchMyBookedslots
  - `stores/credits.ts` - Credits store with refund management
  - `server/api/bookings/[email].ts` - Fetch bookings by email
  - `server/api/bookedslots/email/[email].ts` - Fetch booked slots by email
  - `server/api/cancelledBookings/[id].post.ts` - Move booking to cancelled
  - `server/api/cancelledSlots/[id].post.ts` - Move slot to cancelled
  - `server/api/creditRefunds/` - Credit refund API endpoints

## Testing Approach

This is a testing and debugging proposal, not a feature addition. The focus is on:

1. Creating test scenarios to verify existing functionality
2. Identifying bugs and issues
3. Documenting expected vs actual behavior
4. Fixing any issues found during testing

## Success Criteria

- Bookings display correctly on the profile page
- Upcoming and past bookings are properly filtered by date
- Cancellation workflow completes successfully
- Credits are refunded correctly and appear in user profile
- All edge cases are handled (no bookings, expired slots, etc.)
- Custom confirmation dialog replaces browser `confirm()` with better UX
- Custom alert snackbar replaces browser `alert()` with styled notifications
- Profile editing works correctly with validation
- Password reset works for email users
