# Design Document: reCAPTCHA Implementation for All Forms

## Context

The Ark platform uses Google reCAPTCHA v3 for bot protection on form submissions. The current implementation is inconsistent:

- **Booking Form**: Has reCAPTCHA with a TODO comment suggesting uncertainty
- **Package Purchase Form**: Has reCAPTCHA implementation
- **Contact Us Form**: Missing reCAPTCHA protection entirely

The existing infrastructure includes:
- `composables/useRecaptchaHandler.ts` - Reusable composable for reCAPTCHA verification
- `server/api/recaptcha.post.ts` - Server-side verification endpoint
- `plugins/recaptcha.client.ts` - Client-side reCAPTCHA initialization
- Environment variables: `RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`

## Goals / Non-Goals

### Goals
- Ensure all user-facing forms have reCAPTCHA protection
- Verify existing implementations are working correctly
- Standardize error handling across all forms
- Remove uncertainty (TODO comments) about reCAPTCHA status

### Non-Goals
- Changing the reCAPTCHA version (staying with v3)
- Implementing custom reCAPTCHA UI (v3 is invisible)
- Adding reCAPTCHA to authentication forms (Google Sign-In, Email Sign-In/Up)
- Changing the score threshold without data-driven justification

## Decisions

### Decision 1: Use Existing `useRecaptchaHandler` Composable

**Rationale**: The composable is already implemented and working in two forms. It provides:
- Consistent API across all forms
- Centralized error handling
- Server-side verification via `/api/recaptcha` endpoint
- Loading state management

**Implementation**: Import and use in Contact Us form the same way as booking and package forms.

### Decision 2: Maintain Score Threshold of 0.5

**Current implementation**: Server rejects scores below 0.5 (see `server/api/recaptcha.post.ts:30`)

**Rationale**: 
- 0.5 is a balanced threshold (Google recommends 0.5 as default)
- No evidence of false positives or negatives with current threshold
- Can be adjusted later based on production data

**Alternative considered**: Lower threshold (0.3) for less strict validation, but no current need.

### Decision 3: Use "submit_form" Action Name for All Forms

**Current state**: 
- Booking form uses "submit_form"
- Package form uses "submit_form"
- ButtonRecaptcha.vue uses "login" (test component)

**Rationale**: Consistent action names help with reCAPTCHA analytics and debugging.

**Implementation**: Contact Us form will also use "submit_form" action.

### Decision 4: Alert-Based Error Handling

**Current implementation**: Both existing forms use `alert()` for reCAPTCHA errors.

**Rationale**: 
- Consistent with existing UX
- Simple and immediate feedback
- reCAPTCHA failures are rare for legitimate users

**Alternative considered**: Toast notifications or inline error messages, but would require additional UI components.

### Decision 5: Verify Before Submit Pattern

**Pattern**:
```typescript
async function submitHandler() {
  // 1. Validate form
  // 2. Set loading state
  // 3. Verify reCAPTCHA
  // 4. If failed, alert and return
  // 5. Proceed with submission
}
```

**Rationale**: This pattern is already used successfully in booking and package forms.

## Risks / Trade-offs

### Risk 1: Environment Variables Not Configured
**Impact**: reCAPTCHA will fail in production
**Mitigation**: 
- Verify environment variables are set before deployment
- Add to verification tasks (1.1, 1.2)
- Test in production environment (4.4)

### Risk 2: False Positives Blocking Legitimate Users
**Impact**: Users unable to submit forms
**Mitigation**: 
- Monitor reCAPTCHA scores in production
- Current 0.5 threshold is industry standard
- Can adjust threshold if issues arise

### Risk 3: Network Failures During Verification
**Impact**: Form submission blocked even for legitimate users
**Current handling**: Generic error message "Error verifying reCAPTCHA"
**Trade-off**: Prioritizing security over availability in edge cases

### Risk 4: TODO Comment Indicates Incomplete Testing
**Impact**: Production may not have reCAPTCHA properly configured
**Mitigation**: 
- Comprehensive testing in tasks 1.3, 1.4, 4.3, 4.4
- Remove TODO only after verification

## Migration Plan

### Phase 1: Verification (No User Impact)
1. Verify environment variables
2. Test existing implementations
3. Confirm server endpoint working

### Phase 2: Implementation (Contact Form Only)
1. Add reCAPTCHA to Contact Us form
2. Test in development
3. Deploy to production

### Phase 3: Cleanup
1. Remove TODO comment
2. Update documentation

### Rollback Plan
If issues arise with Contact Us form:
1. Remove reCAPTCHA verification call
2. Revert to previous version
3. Investigate and fix issues
4. Redeploy

## Open Questions

1. **Q**: Should we add visual indicators that reCAPTCHA is active?
   **A**: Not necessary for v3 (invisible), but could add privacy policy link

2. **Q**: Should we log reCAPTCHA scores for analytics?
   **A**: Out of scope for this change, but could be valuable future enhancement

3. **Q**: Should authentication forms also have reCAPTCHA?
   **A**: Out of scope - Google Sign-In has its own protection, email auth is low-risk

4. **Q**: What happens if Google reCAPTCHA service is down?
   **A**: Forms will fail to submit - acceptable trade-off for security

