# Design: Promo Code Pitch and Sport Targeting

## Context

The current promo code system validates codes based on:
- Location matching
- Date range (publish period and validity period)
- Timeslot type matching (e.g., "Off-Peak", "Peak")

This design extends the system to support:
- Pitch-specific targeting (e.g., only Court 1)
- Sport-specific targeting (e.g., only Pickleball)
- Combined targeting (e.g., only Pickleball on Court 1)

The implementation must maintain backward compatibility with existing promo codes in the database that don't have the new fields.

## Goals / Non-Goals

### Goals

- Enable venue operators to create promo codes targeting specific pitches within a location
- Enable venue operators to create promo codes targeting specific sports (Futsal, Pickleball)
- Maintain 100% backward compatibility with existing promo codes
- Ensure discount calculations respect the new targeting rules
- Provide clear error messages when promo codes don't match selected timeslots

### Non-Goals

- Admin UI for creating/managing promo codes (out of scope - assumed to be managed via Firebase console)
- Automatic suggestion of applicable promo codes to users
- Promo code usage analytics or reporting
- Multiple promo codes per booking

## Decisions

### Decision 1: Optional Fields with Explicit Enable Flag

**What**: Add `targetPitches` (array), `targetSpecificPitches` (boolean), and `typeOfSports` (array) as optional fields.

**Why**: 
- `targetSpecificPitches` boolean flag provides explicit control over whether pitch targeting is active
- This prevents accidental targeting when `targetPitches` array exists but shouldn't be enforced
- Optional fields ensure backward compatibility
- Arrays allow multiple pitches/sports to be targeted by a single promo code

**Alternatives considered**:
- Using presence of `targetPitches` array to determine if targeting is active → Rejected because it's less explicit and could cause confusion
- Making fields required → Rejected because it would break existing promo codes

### Decision 2: Validation at Application Time (Client-Side)

**What**: Perform validation in `BookingFormPage3PromoCode.vue` when user clicks "Apply" button.

**Why**:
- Immediate feedback to users
- Consistent with current validation pattern
- Reduces server load
- Promo code data is already fetched client-side via store

**Alternatives considered**:
- Server-side validation → Rejected because current pattern is client-side and promo codes are public data
- Real-time validation as user types → Rejected because validation requires booking context (selected timeslots)

### Decision 3: Filter Timeslots During Discount Calculation

**What**: Update `getDiscount()` function in `composables/payment.ts` to skip timeslots that don't match targeting criteria.

**Why**:
- Allows partial application of promo codes (e.g., discount only applies to matching pitches)
- Consistent with existing timeslot type filtering logic
- Provides flexibility for mixed bookings

**Alternatives considered**:
- All-or-nothing validation (reject if any timeslot doesn't match) → Rejected because it's too restrictive
- Apply discount to all timeslots regardless of targeting → Rejected because it defeats the purpose of targeting

### Decision 4: Pitch Matching via Timeslot Data

**What**: Match pitches by comparing timeslot's pitch identifier with `targetPitches` array.

**Why**:
- Timeslot data already contains pitch information
- No additional data fetching required
- Consistent with how location and timeslot type matching works

**Implementation note**: Need to verify the exact field name in timeslot data that identifies the pitch (likely `pitch`, `pitchKey`, or similar).

### Decision 5: Sport Type Matching via Timeslot Data

**What**: Match sport types by comparing timeslot's `typeOfSports` field with promo code's `typeOfSports` array.

**Why**:
- Timeslot data already contains `typeOfSports` field
- Consistent with existing data model
- No additional queries needed

## Risks / Trade-offs

### Risk 1: Timeslot Data Structure Assumptions

**Risk**: The implementation assumes timeslots have pitch and sport identifiers. If the data structure is different, validation logic will fail.

**Mitigation**: 
- Review actual timeslot data structure before implementation
- Add defensive checks for missing fields
- Test with real booking data

### Risk 2: Partial Discount Application Confusion

**Risk**: Users might be confused if promo code only applies to some of their selected timeslots.

**Mitigation**:
- Consider adding informational message showing which timeslots received the discount
- Document this behavior for venue operators
- Future enhancement: Show breakdown in UI

### Risk 3: Database Field Name Conflicts

**Risk**: New field names might conflict with existing fields or future Firebase features.

**Mitigation**:
- Use descriptive, namespaced field names
- Follow existing naming conventions in the codebase
- Document field purposes in code comments

## Migration Plan

### Phase 1: Code Deployment

1. Deploy updated code with new validation logic
2. Existing promo codes continue to work (no new fields = no targeting)
3. No database migration needed

### Phase 2: Testing

1. Create test promo code with pitch targeting in Firebase console
2. Verify validation works correctly
3. Test backward compatibility with existing promo codes

### Phase 3: Rollout

1. Venue operators can start creating targeted promo codes
2. Monitor for any validation issues
3. Gather feedback on partial discount application behavior

### Rollback Plan

If issues arise:
1. Revert code deployment
2. Existing promo codes continue to work
3. New targeted promo codes will be ignored (treated as invalid due to missing validation logic)

## Open Questions

1. **Q**: Should we validate that `targetPitches` contains valid pitch IDs?
   **A**: Not in initial implementation - assume venue operators enter correct IDs. Future enhancement could add validation.

2. **Q**: What happens if a promo code targets pitches that don't exist at the selected location?
   **A**: Promo code will be rejected (no matching timeslots). This is acceptable behavior.

3. **Q**: Should we support negative targeting (e.g., "all pitches except Court 1")?
   **A**: Not in initial implementation. Can be added later if needed.

4. **Q**: How do we handle the exact field name for pitch identification in timeslots?
   **A**: Need to inspect actual timeslot data structure. Likely candidates: `pitch`, `pitchKey`, `pitchId`, or similar.

