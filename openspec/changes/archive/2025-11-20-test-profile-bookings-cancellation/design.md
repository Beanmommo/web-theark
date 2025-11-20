# Design Document: Profile Bookings and Cancellation Testing

## Context

The profile page is experiencing issues where bookings are not displaying properly. This is a critical user-facing feature that affects user experience and trust. The system has a complex architecture with:

- **Dual database system**: Both Firestore and Realtime Database (RTDB) for backward compatibility
- **Multi-step cancellation workflow**: Involves multiple collections and external systems
- **Credit refund system**: Complex calculation and tracking of refunds vs purchased credits
- **Singapore timezone handling**: All date comparisons use Asia/Singapore timezone

### Current Architecture

**Data Flow for Booking Display:**

1. User navigates to `/profile`
2. `ProfileUpcomingBookings.vue` component mounts
3. Calls `bookingsStore.fetchMyBookings(email)` → `/api/bookings/[email]`
4. Calls `bookedslotsStore.fetchMyBookedslots(email)` → `/api/bookedslots/email/[email]`
5. Both APIs query Firestore and RTDB, merge results
6. Component filters bookings by date (upcoming vs past)
7. Renders `ProfileBookingCard` for each booking

**Data Flow for Cancellation:**

1. User clicks "Cancel Booking" on a booking card
2. `ProfileBookingCard.vue` calls `bookingsStore.cancelBooking(bookingKey)`
3. Cancellation workflow executes 9 steps:
   - Fetch original booking
   - Create cancelled booking data
   - Move booking to cancelledBookings
   - Fetch and move all booked slots to cancelledSlots
   - Delete slots from automate system
   - Update original invoice to "Refund"
   - Create refund invoice
   - Add credit refund to user account
   - Delete original booking and slots
4. Refresh bookings list
5. Show success message

## Goals / Non-Goals

### Goals

- Identify why bookings are not displaying on the profile page
- Verify the complete cancellation workflow works correctly
- Ensure credit refunds are calculated and displayed properly
- Fix any bugs found during testing
- Document the expected behavior in a spec
- **Add user profile editing**: Allow users to update display name and contact number
- **Add password change**: Enable email users to reset their password
- **Protect email field**: Prevent email changes to maintain booking integrity

### Non-Goals

- Redesigning the profile page UI (only adding edit functionality)
- Changing the cancellation policy (72-hour rule)
- Modifying the credit refund calculation formula
- Allowing email changes (email is the booking identifier)
- Implementing full account deletion or deactivation
- Adding two-factor authentication

## Decisions

### Testing Strategy

**Decision**: Use manual testing with real user accounts and data, supplemented by browser console debugging.

**Rationale**:

- The issue is user-facing and requires visual verification
- Complex data flow across multiple systems is hard to unit test
- Need to verify actual database state changes
- Browser console can reveal API errors and data structure issues

**Alternatives considered**:

- Automated E2E tests: Too time-consuming to set up for debugging
- Unit tests only: Won't catch integration issues between components and APIs

### Debugging Approach

**Decision**: Start with data verification, then work backwards through the component tree.

**Steps**:

1. Verify data exists in databases (Firestore/RTDB)
2. Verify API endpoints return correct data
3. Verify stores receive and process data correctly
4. Verify components receive data from stores
5. Verify UI rendering logic

**Rationale**: This approach isolates the issue layer by layer, from backend to frontend.

### Fix Priority

**Decision**: Fix booking display first, then test cancellation workflow.

**Rationale**: Users need to see bookings before they can cancel them. Display issues are blocking cancellation testing.

## Potential Issues and Hypotheses

### Issue 1: Bookings Not Displaying

**Possible Causes**:

1. **API not returning data**: Check if `/api/bookings/[email]` returns empty object
2. **Condition not met**: `Object.keys(myBookedslots).length > 0` might be false even with bookings
3. **Date filtering too aggressive**: Upcoming bookings filter might be excluding valid bookings
4. **Loading state stuck**: `isLoading` might not be set to false
5. **Email mismatch**: User email might not match booking email format

**Testing Approach**:

- Check network tab for API responses
- Console log `myBookings` and `myBookedslots` values
- Console log `upcomingBookings` computed value
- Verify user email matches booking email

### Issue 2: Condition Logic Problem

**Current Code** (ProfileUpcomingBookings.vue:42):

```vue
<template v-if="!isLoading && Object.keys(myBookedslots).length > 0"></template>
```

**Potential Issue**: This condition requires `myBookedslots` to have data, but it should check `myBookings` instead or both.

**Hypothesis**: If a user has bookings but the booked slots are missing or expired, the bookings won't display.

**Fix**: Change condition to:

```vue
<template
  v-if="
    !isLoading &&
    (myBookings.length > 0 || Object.keys(myBookedslots).length > 0)
  "
></template>
```

### Issue 3: Date Filtering

**Current Code** (ProfileUpcomingBookings.vue:29-33):

```javascript
const upcomingBookings = computed(() => {
  return myBookings.value.filter((booking) => {
    return dayjs(booking.date)
      .tz("Asia/Singapore")
      .isSameOrAfter(dayjs().tz("Asia/Singapore"), "day");
  });
});
```

**Potential Issue**: If booking dates are stored in different formats or timezones, the filter might exclude valid bookings.

**Testing**: Log booking dates and current date to verify comparison logic.

## Risks / Trade-offs

### Risk 1: Data Inconsistency Between Databases

**Risk**: Bookings might exist in RTDB but not Firestore, or vice versa.

**Mitigation**:

- Test with users who have bookings in both databases
- Verify merge logic in API endpoints
- Log which database returns data

### Risk 2: Cancellation Workflow Partial Failure

**Risk**: If one step in the 9-step cancellation workflow fails, the system might be in an inconsistent state.

**Mitigation**:

- Test cancellation with various scenarios
- Verify error handling at each step
- Check that automate deletion failure doesn't block refund
- Verify rollback or cleanup if needed

### Risk 3: Credit Refund Calculation Errors

**Risk**: Refund amount might be calculated incorrectly, leading to financial discrepancies.

**Mitigation**:

- Test with bookings that have discounts
- Test with bookings without discounts
- Verify formula: `refundAmount = booking.subtotal - booking.discount`
- Check that GST and transaction fees are not included in refund

## Migration Plan

Not applicable - this is a testing and bug fix proposal, not a migration.

## Profile Editing Design

### User Profile Update Flow

**Decision**: Use Firebase Authentication `updateProfile()` for display name and store phone number in user metadata.

**Implementation**:

1. User clicks "Edit" button in ProfileUserDetails component
2. Component enters edit mode, showing input fields
3. User modifies display name and/or contact number
4. User clicks "Save"
5. Component validates inputs
6. Call Firebase Auth API to update user profile
7. Show success/error message
8. Exit edit mode and display updated information

**API Methods**:

```javascript
// Update display name
await updateProfile(auth.currentUser, {
  displayName: newDisplayName,
});

// Update phone number - store in Firestore user document
// (Simpler than Firebase Auth phone which requires SMS verification)
await updateDoc(doc(firestore, "users", userId), {
  phoneNumber: newPhoneNumber,
});
```

**Note**: Phone number updates stored in Firestore user document to avoid SMS verification complexity.

### Password Change Design

**Decision**: Use Firebase Auth `sendPasswordResetEmail()` for password changes.

**Rationale**:

- Secure: Uses Firebase's built-in password reset flow
- No need to handle password validation or storage
- User receives email with secure reset link
- Works with existing Firebase Auth setup

**Implementation**:

```javascript
// Detect sign-in provider
const user = auth.currentUser;
const isEmailProvider = user.providerData.some(
  (provider) => provider.providerId === "password"
);

// Send reset email (only for email users)
if (isEmailProvider) {
  await sendPasswordResetEmail(auth, user.email);
}
```

**UI Flow**:

1. Check user's sign-in provider on profile page load
2. If email provider: Show "Change Password" button
3. If Google provider: Hide button, show "Account managed by Google" text
4. When clicked: Show confirmation dialog
5. Send password reset email
6. Show success message with instructions

### Email Protection Design

**Decision**: Make email field read-only with explanatory text.

**Rationale**:

- Email is used as the primary identifier for bookings
- Changing email would break the link to historical bookings
- Users can create a new account if they need a different email

**Implementation**:

- Display email as plain text (not input field)
- Add tooltip or help text: "Email cannot be changed as it's used to identify your bookings"
- No edit button for email field

## Custom Dialog and Alert System Design

### Problem Statement

The application currently uses browser native `confirm()` and `alert()` dialogs, which:

- Have poor UX (browser-default styling, not customizable)
- Are not mobile-friendly
- Block the entire page (synchronous)
- Don't match the application's Vuetify design system
- Cannot be styled or themed
- Provide inconsistent experience across browsers

### Solution: Custom Components

**Decision**: Create reusable Vuetify-based dialog and alert components.

**Components Created**:

1. **ConfirmDialog.vue** - Reusable confirmation dialog
2. **AlertSnackbar.vue** - Snackbar for alerts (appears at top)
3. **GlobalAlert.vue** - Global alert wrapper
4. **useAlert.ts** - Composable for global alert management

### ConfirmDialog Design

**Purpose**: Replace browser `confirm()` with a styled, customizable dialog.

**Features**:

- Customizable title, message, and details
- Customizable button text and colors
- Emits `@confirm` and `@cancel` events
- Vuetify VDialog component
- Responsive and mobile-friendly
- Non-blocking (asynchronous)

**API**:

```vue
<ConfirmDialog
  v-model="showDialog"
  title="Cancel Booking"
  message="Are you sure you want to cancel this booking?"
  :details="`You will receive $${amount} credits...`"
  confirm-text="Yes, Cancel Booking"
  cancel-text="No, Keep Booking"
  confirm-color="error"
  @confirm="handleConfirm"
  @cancel="handleCancel"
/>
```

**Props**:

- `modelValue` (Boolean) - Controls visibility
- `title` (String, required) - Dialog title
- `message` (String, required) - Main message
- `details` (String, optional) - Additional details
- `confirmText` (String, default: "Confirm") - Confirm button text
- `cancelText` (String, default: "Cancel") - Cancel button text
- `confirmColor` (String, default: "error") - Confirm button color
- `maxWidth` (String, default: "500") - Dialog max width
- `persistent` (Boolean, default: false) - Prevent closing by clicking outside

### AlertSnackbar Design

**Purpose**: Replace browser `alert()` with styled notifications.

**Features**:

- 4 types: `success`, `error`, `warning`, `info`
- Auto-dismiss with configurable timeout
- Type-specific icons and colors
- Positioned at top of screen
- Closable with X button
- Vuetify VSnackbar component

**API**:

```vue
<AlertSnackbar
  v-model="showAlert"
  message="Booking cancelled successfully!"
  type="success"
  :timeout="5000"
/>
```

**Props**:

- `modelValue` (Boolean) - Controls visibility
- `message` (String, required) - Alert message
- `type` (String, default: "info") - Alert type: `success`, `error`, `warning`, `info`
- `timeout` (Number, default: 5000) - Auto-hide timeout in milliseconds
- `closable` (Boolean, default: true) - Show close button

**Type Styling**:

- `success` - Green color, check-circle icon
- `error` - Red color, alert-circle icon
- `warning` - Orange color, alert icon
- `info` - Blue color, information icon

### GlobalAlert Design

**Purpose**: Provide app-wide alert system without adding component to each page.

**Implementation**:

1. `GlobalAlert.vue` component added to `layouts/default.vue`
2. `useAlert()` composable manages global alert state
3. Any component can call `showSuccess()`, `showError()`, etc.

**Composable API**:

```typescript
const {
  showSuccess, // (message: string, timeout?: number) => void
  showError, // (message: string, timeout?: number) => void
  showWarning, // (message: string, timeout?: number) => void
  showInfo, // (message: string, timeout?: number) => void
  showAlert, // (message: string, type: AlertType, timeout?: number) => void
  hideAlert, // () => void
} = useAlert();
```

**Usage Example**:

```typescript
const { showSuccess, showError } = useAlert();

async function saveData() {
  try {
    await $fetch("/api/save", { method: "POST", body: data });
    showSuccess("Data saved successfully!");
  } catch (error) {
    showError("Failed to save data. Please try again.");
  }
}
```

### Migration Strategy

**Phase 1**: Create components (✅ COMPLETED)

- Created ConfirmDialog.vue
- Created AlertSnackbar.vue
- Created GlobalAlert.vue
- Created useAlert.ts composable
- Added GlobalAlert to layouts/default.vue

**Phase 2**: Update ProfileBookingCard (✅ COMPLETED)

- Replaced `confirm()` with ConfirmDialog
- Replaced `alert()` with useAlert composable
- Updated cancellation flow to use new components

**Phase 3**: Future migrations (NOT STARTED)

- Find other uses of `confirm()` and `alert()` in codebase
- Replace with custom components
- Remove all browser dialog dependencies

### Benefits

| Feature           | Browser Dialogs      | Custom Components      |
| ----------------- | -------------------- | ---------------------- |
| **Styling**       | ❌ Browser default   | ✅ Vuetify themed      |
| **Mobile UX**     | ❌ Poor              | ✅ Responsive          |
| **Customizable**  | ❌ Limited           | ✅ Fully customizable  |
| **Consistent**    | ❌ Browser-dependent | ✅ Same everywhere     |
| **Blocking**      | ❌ Blocks page       | ✅ Non-blocking        |
| **Accessibility** | ❌ Limited           | ✅ Better a11y         |
| **Icons**         | ❌ No icons          | ✅ Type-specific icons |
| **Position**      | ❌ Center only       | ✅ Top (snackbar)      |
| **Theming**       | ❌ No theming        | ✅ Matches app theme   |

## Open Questions

1. **Should the booking display condition check both `myBookings` and `myBookedslots`?**

   - Current: Only checks `myBookedslots`
   - Proposed: Check both or just `myBookings`

2. **What should happen if automate deletion fails during cancellation?**

   - Current: Logs error and continues
   - Question: Should we notify admin or retry?

3. **Should we add retry logic for failed API calls?**

   - Current: No retry logic
   - Consideration: Add exponential backoff retry for transient failures

4. **Should we add analytics/logging for booking display issues?**

   - Track how often bookings fail to load
   - Track which database (Firestore vs RTDB) is being used

5. **Should expired booked slots be cleaned up?**

   - Old slots might be cluttering the database
   - Consider adding a cleanup job

6. **How should we store phone number updates?**

   - Option A: Use Firebase Auth phone number (requires SMS verification)
   - Option B: Store in Firestore user document (simpler, no verification)
   - **Recommendation**: Option B for simplicity

7. **Should profile updates affect existing bookings?**

   - Decision: No, existing bookings retain original information
   - New bookings use updated profile information
   - This maintains historical accuracy

8. **Should we require re-authentication before profile updates?**
   - For sensitive changes (password), Firebase handles this
   - For display name/phone, probably not needed
   - Consider adding for security-conscious users
