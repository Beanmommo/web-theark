# Testing Instructions for reCAPTCHA Implementation

## Overview

This document provides instructions for manually testing the reCAPTCHA implementation across all three forms.

## Prerequisites

1. Development server running: `npm run dev`
2. Environment variables configured:
   - `RECAPTCHA_SITE_KEY=6LerYY0qAAAAAAeioK5vqL0tS4EYHHA2VgY4znmD`
   - `RECAPTCHA_SECRET_KEY=6LerYY0qAAAAACoEZIW9RSHO_TKB7rJjARa2eVIg`

## Test Cases

### 1. Contact Us Form

**URL**: `http://localhost:3002/contactus`

**Test Steps**:
1. Navigate to the contact us page
2. Fill in all required fields:
   - First Name
   - Last Name
   - Email
   - Message
3. Click "Send" button
4. Observe the following:
   - Loading indicator appears
   - reCAPTCHA verification happens in background (invisible)
   - If successful: Redirects to `/contactus/thankyou`
   - If failed: Alert message appears with error

**Expected Behavior**:
- ✅ Form submits successfully with valid data
- ✅ Loading state prevents double submission
- ✅ reCAPTCHA verification happens before submission
- ✅ Error alert appears if reCAPTCHA fails

### 2. Booking Form

**URL**: `http://localhost:3002/futsal/booking` or `http://localhost:3002/pickleball/booking`

**Test Steps**:
1. Navigate to booking page
2. Complete Page 1: Select venue, date, and time slots
3. Complete Page 2: Sign in or create account
4. Complete Page 3: Fill in booking details
5. Click "Confirm My Booking"
6. Observe the following:
   - Loading indicator appears with "Submitting your booking..." message
   - reCAPTCHA verification happens in background
   - If successful: Proceeds to payment
   - If failed: Alert message appears with error

**Expected Behavior**:
- ✅ Form submits successfully with valid data
- ✅ Loading state prevents double submission
- ✅ reCAPTCHA verification happens before submission
- ✅ Error alert appears if reCAPTCHA fails
- ✅ No TODO comment visible in code

### 3. Package Purchase Form

**URL**: `http://localhost:3002/futsal/packages` or `http://localhost:3002/pickleball/packages`

**Test Steps**:
1. Navigate to packages page
2. Complete Page 1: Select a credit package
3. Complete Page 2: Sign in or create account
4. Complete Page 3: Fill in purchase details
5. Click "Confirm My Purchase"
6. Observe the following:
   - Loading indicator appears with "Submitting your purchase..." message
   - reCAPTCHA verification happens in background
   - If successful: Proceeds to payment
   - If failed: Alert message appears with error

**Expected Behavior**:
- ✅ Form submits successfully with valid data
- ✅ Loading state prevents double submission
- ✅ reCAPTCHA verification happens before submission
- ✅ Error alert appears if reCAPTCHA fails

## Verification Checklist

### Code Verification
- [x] All three forms import `useReCaptchaHandler`
- [x] All three forms call `verifyRecaptcha("submit_form")`
- [x] All three forms handle errors consistently with `alert()`
- [x] All three forms reset loading state on error
- [x] TODO comment removed from BookingFormPage3.vue

### Environment Verification
- [x] `RECAPTCHA_SITE_KEY` configured in `.env`
- [x] `RECAPTCHA_SECRET_KEY` configured in `.env`
- [x] `nuxt.config.ts` loads keys correctly
- [x] Server endpoint `/api/recaptcha` exists and works

### Server-Side Verification
- [x] Server checks token is provided
- [x] Server verifies token with Google API
- [x] Server enforces score threshold of 0.5
- [x] Server returns appropriate error messages

## Testing reCAPTCHA Failure Scenarios

To test reCAPTCHA failure handling, you can:

1. **Temporarily modify the score threshold** in `server/api/recaptcha.post.ts`:
   ```typescript
   if (!success || score < 1.0) // Change from 0.5 to 1.0 to force failure
   ```

2. **Use invalid site key** temporarily in `.env`:
   ```
   RECAPTCHA_SITE_KEY=invalid_key
   ```

3. **Simulate network error** by temporarily commenting out the Google API call

**Remember to revert these changes after testing!**

## Browser Console Checks

Open browser DevTools and check:

1. **Network Tab**:
   - POST request to `/api/recaptcha` should appear
   - Response should include `success: true` and `score` value

2. **Console Tab**:
   - No reCAPTCHA errors should appear
   - No "reCAPTCHA not loaded" errors

3. **Application Tab**:
   - Check that reCAPTCHA script is loaded from Google

## Production Testing

Before deploying to production:

1. Verify environment variables are set in production environment
2. Test all three forms in production
3. Monitor reCAPTCHA scores in Google reCAPTCHA Admin Console
4. Check for any false positives blocking legitimate users

## Success Criteria

All tests pass when:
- ✅ All three forms successfully verify reCAPTCHA before submission
- ✅ Forms handle reCAPTCHA failures gracefully with error messages
- ✅ Loading states prevent double submission
- ✅ No console errors related to reCAPTCHA
- ✅ Consistent behavior across all forms

