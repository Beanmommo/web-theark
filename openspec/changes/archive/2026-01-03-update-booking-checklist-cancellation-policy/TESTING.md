# Testing Guide

## Overview

This document provides testing instructions for the booking checklist cancellation policy feature.

## Prerequisites

1. **Dev server running**: `npm run dev` at http://localhost:3000
2. **Admin access**: Ability to configure pitch `allowCancellation` property
3. **Test data**: At least one location with multiple pitches

## Test Scenarios

### Scenario 1: All Pitches Allow Cancellation (Default Behavior)

**Setup:**
- Ensure all pitches at a location have `allowCancellation: true` (or undefined)

**Steps:**
1. Navigate to booking page (e.g., `/futsal/booking`)
2. Select a venue and date
3. Select one or more time slots
4. Proceed to Page 3 (Payment & Checklist)

**Expected Result:**
- ✅ All 3 checkboxes should be visible:
  1. Terms and conditions
  2. 72-hour rescheduling notice
  3. Inclement weather policy
- ✅ Form should require BOTH terms AND weather policy checkboxes to be checked
- ✅ "Confirm My Booking" button should be disabled until both are checked

---

### Scenario 2: All Pitches Do Not Allow Cancellation

**Setup:**
- Configure at least one pitch with `allowCancellation: false` in admin portal
- Ensure the selected slots use only non-cancellable pitches

**Steps:**
1. Navigate to booking page
2. Select the venue with non-cancellable pitches
3. Select time slots on the non-cancellable pitch
4. Proceed to Page 3

**Expected Result:**
- ✅ Only 1 checkbox should be visible:
  1. Terms and conditions
- ✅ Checkboxes 2 and 3 should be HIDDEN
- ✅ Form should require ONLY the terms checkbox to be checked
- ✅ "Confirm My Booking" button should be enabled when terms is checked

---

### Scenario 3: Mixed Pitches (Some Allow, Some Don't)

**Setup:**
- Configure some pitches with `allowCancellation: false`
- Configure other pitches with `allowCancellation: true`

**Steps:**
1. Navigate to booking page
2. Select time slots across BOTH cancellable and non-cancellable pitches
3. Proceed to Page 3

**Expected Result:**
- ✅ Only 1 checkbox should be visible (conservative approach)
- ✅ Checkboxes 2 and 3 should be HIDDEN
- ✅ Form should require ONLY the terms checkbox

---

### Scenario 4: Legacy Pitches (No allowCancellation Property)

**Setup:**
- Use pitches that don't have the `allowCancellation` property defined

**Steps:**
1. Navigate to booking page
2. Select time slots on legacy pitches
3. Proceed to Page 3

**Expected Result:**
- ✅ All 3 checkboxes should be visible (backward compatible)
- ✅ Form should require BOTH terms AND weather policy checkboxes

---

### Scenario 5: Form Submission

**Test with cancellable pitches:**
1. Select cancellable pitches
2. Proceed to Page 3
3. Check only the terms checkbox (not weather)
4. Verify "Confirm My Booking" button is DISABLED
5. Check the weather policy checkbox
6. Verify "Confirm My Booking" button is ENABLED
7. Complete the booking

**Test with non-cancellable pitches:**
1. Select non-cancellable pitches
2. Proceed to Page 3
3. Check the terms checkbox
4. Verify "Confirm My Booking" button is ENABLED immediately
5. Complete the booking

---

## Manual Testing Checklist

- [ ] Scenario 1: All pitches allow cancellation - All 3 checkboxes visible
- [ ] Scenario 2: All pitches don't allow cancellation - Only terms checkbox visible
- [ ] Scenario 3: Mixed pitches - Only terms checkbox visible
- [ ] Scenario 4: Legacy pitches - All 3 checkboxes visible (backward compatible)
- [ ] Scenario 5a: Form submission with cancellable pitches - Requires both checkboxes
- [ ] Scenario 5b: Form submission with non-cancellable pitches - Requires only terms
- [ ] Visual check: Checkboxes are properly hidden/shown (no layout issues)
- [ ] Console check: No JavaScript errors in browser console
- [ ] Mobile check: Works correctly on mobile viewport

---

## How to Configure Pitch Cancellation in Admin Portal

1. Log in to admin portal
2. Navigate to Pitches management
3. Find the pitch you want to configure
4. Toggle the "Allow Cancellation" switch
   - **ON** (true): Customers can cancel/reschedule bookings
   - **OFF** (false): Customers cannot cancel/reschedule bookings
5. Save changes

---

## Debugging Tips

**If checkboxes don't hide when expected:**
1. Check browser console for errors
2. Verify pitch has `allowCancellation: false` in database
3. Verify pitch matching logic (locationKey, pitch name, typeOfSports)
4. Check that `bookingDetails.location` matches the pitch's location

**If form validation doesn't work:**
1. Check that `inputHandler()` is being called
2. Verify `allowsCancellation` computed property returns correct value
3. Check that emit('update', true/false) is being called correctly

---

## Success Criteria

✅ All 5 test scenarios pass
✅ No JavaScript errors in console
✅ Form validation works correctly in all scenarios
✅ Booking submission completes successfully
✅ User experience is clear and not confusing

