# Ensure reCAPTCHA Implementation for All Form Submissions

## Why

The application currently has inconsistent reCAPTCHA protection across form submissions. While the booking form and package purchase form have reCAPTCHA verification implemented, the contact us form lacks this critical security measure. This creates a vulnerability where the contact form can be exploited by bots for spam submissions, potentially overwhelming the system and degrading the user experience.

Additionally, there's a TODO comment in the booking form code indicating uncertainty about the reCAPTCHA configuration, suggesting the implementation may not be fully tested or verified in production.

## What Changes

- **Add reCAPTCHA verification** to the Contact Us form (`FormContactUs.vue`) before submission
- **Verify and test** existing reCAPTCHA implementation in booking and package purchase forms
- **Ensure environment variables** (`RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`) are properly configured
- **Remove TODO comment** in `BookingFormPage3.vue` after verification
- **Standardize error handling** for reCAPTCHA failures across all forms
- **Add visual feedback** (optional) to indicate reCAPTCHA is active on forms

## Impact

### Affected Specs
- **NEW**: `form-security` - New capability spec for form submission security requirements

### Affected Code
- `components/FormContactUs.vue` - Add reCAPTCHA verification to submit handler
- `components/BookingFormPage3.vue` - Remove TODO comment after verification (line 250)
- `components/PackagePurchasePage3.vue` - Verify implementation is working
- `composables/useRecaptchaHandler.ts` - Already exists and working
- `server/api/recaptcha.post.ts` - Already exists and working
- `plugins/recaptcha.client.ts` - Already exists and working

### Affected Forms
1. **Booking Form** (BookingFormPage3.vue) - ✅ Already implemented, needs verification
2. **Package Purchase Form** (PackagePurchasePage3.vue) - ✅ Already implemented, needs verification
3. **Contact Us Form** (FormContactUs.vue) - ❌ Missing implementation, needs addition

### Environment Requirements
- `RECAPTCHA_SITE_KEY` - Must be configured in environment
- `RECAPTCHA_SECRET_KEY` - Must be configured in environment

### User Experience Impact
- Minimal impact on legitimate users (reCAPTCHA v3 runs in background)
- Improved security against bot submissions
- Consistent security posture across all forms
- Better error messages if reCAPTCHA fails

### Technical Debt Addressed
- Removes TODO comment indicating incomplete implementation
- Standardizes security approach across all user-facing forms
- Ensures compliance with security constraints documented in project.md

