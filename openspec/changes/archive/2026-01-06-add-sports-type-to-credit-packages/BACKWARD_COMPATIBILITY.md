# Backward Compatibility Guide

## Critical Requirement

**All existing purchased credit packages in the database do NOT have the `typeOfSports` field and MUST default to "futsal" to ensure they remain usable.**

## Background

### Two Types of Packages

1. **Package Definitions** (`/packages` collection)
   - Configured in admin portal
   - Already have `typeOfSports` field
   - Used as templates for purchase
   - ✅ Already working correctly

2. **Purchased Credit Packages** (`/creditPackages` collection)
   - Created when users purchase packages
   - Contain nested `creditPackage` object with package details
   - **DO NOT have `typeOfSports` in the nested object**
   - ⚠️ Need backward compatibility handling

## Database State

### Existing Purchased Package (Before This Change)
```json
{
  "key": "abc123",
  "amount": "100",
  "creditsLeft": 100,
  "userKey": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "expiryDate": "2024-12-31",
  "creditPackage": {
    "id": "package1",
    "title": "Standard Package",
    "amount": "100",
    "value": "120",
    "type": "Corporate",
    "expiryPeriod": 6,
    "unit": "months"
    // ⚠️ NO typeOfSports field!
  }
}
```

### New Purchased Package (After This Change)
```json
{
  "key": "xyz789",
  "amount": "100",
  "creditsLeft": 100,
  "userKey": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "expiryDate": "2024-12-31",
  "creditPackage": {
    "id": "package2",
    "title": "Futsal Package",
    "amount": "100",
    "value": "120",
    "type": "Corporate",
    "expiryPeriod": 6,
    "unit": "months",
    "typeOfSports": "Futsal"  // ✅ Has typeOfSports field
  }
}
```

## Implementation Pattern

### Correct Default Handling

```typescript
// ✅ CORRECT - Default to "futsal" for missing typeOfSports
const pkgSportType = pkg.creditPackage?.typeOfSports?.toLowerCase() ?? "futsal";

if (sportType && pkgSportType !== sportType.toLowerCase()) {
  return false; // Filter out non-matching packages
}
```

### Incorrect Handling (DO NOT DO THIS)

```typescript
// ❌ WRONG - Would exclude all legacy packages
if (!pkg.creditPackage?.typeOfSports) {
  return false; // This breaks existing credits!
}

// ❌ WRONG - Would show legacy packages for all sports
if (!pkg.creditPackage?.typeOfSports) {
  return true; // This allows using Futsal credits for Pickleball!
}
```

## Expected Behavior

### Scenario 1: User with Legacy Credits Books Futsal
- **User has**: $100 legacy credits (no typeOfSports)
- **User books**: Futsal court
- **Expected**: 
  - ✅ Shows $100 available credits
  - ✅ Can use credits for payment
  - ✅ Credits deducted successfully

### Scenario 2: User with Legacy Credits Books Pickleball
- **User has**: $100 legacy credits (no typeOfSports → defaults to "futsal")
- **User books**: Pickleball court
- **Expected**:
  - ✅ Shows $0 available credits
  - ✅ Cannot use legacy credits (they're Futsal credits)
  - ✅ User must purchase Pickleball credits

### Scenario 3: User with Mixed Credits Books Futsal
- **User has**:
  - $100 legacy credits (no typeOfSports → defaults to "futsal")
  - $50 new Futsal credits (typeOfSports: "Futsal")
  - $30 new Pickleball credits (typeOfSports: "Pickleball")
- **User books**: Futsal court
- **Expected**:
  - ✅ Shows $150 available credits (legacy $100 + new Futsal $50)
  - ✅ Pickleball $30 is hidden
  - ✅ Can use any combination of legacy and new Futsal credits

## Testing Requirements

### Critical Tests

1. **Legacy Package Defaults to Futsal**
   - Create test with package missing `typeOfSports`
   - Verify it's treated as "futsal"

2. **Legacy Package Works for Futsal**
   - Book Futsal court
   - Verify legacy credits appear in available balance
   - Verify payment succeeds

3. **Legacy Package Rejected for Pickleball**
   - Book Pickleball court
   - Verify legacy credits do NOT appear
   - Verify user cannot use them

4. **Mixed Environment Calculates Correctly**
   - User with legacy + new packages
   - Verify totals include only matching sport types
   - Verify both old and new Futsal packages count together

## Migration Strategy

### No Data Migration Required

- ✅ No database updates needed
- ✅ No scripts to run
- ✅ Existing data works as-is
- ✅ New purchases will include `typeOfSports`

### Gradual Transition

1. **Immediately after deployment**: Legacy credits work for Futsal
2. **As users purchase new packages**: New credits have explicit sport type
3. **Over time**: Legacy credits expire naturally (6-month expiry)
4. **Eventually**: All active credits have explicit sport type

## Risk Mitigation

### What Could Go Wrong?

1. **Risk**: Legacy credits become unusable
   - **Mitigation**: Default to "futsal" ensures they work
   - **Test**: Verify legacy package can be used for Futsal booking

2. **Risk**: Legacy credits work for all sports
   - **Mitigation**: Default to "futsal" limits them to Futsal only
   - **Test**: Verify legacy package rejected for Pickleball booking

3. **Risk**: Credit balance shows incorrect totals
   - **Mitigation**: Filter includes both legacy and new Futsal packages
   - **Test**: Verify mixed environment calculates correct totals

## Summary

✅ **Default to "futsal"** for all packages without `typeOfSports`  
✅ **No data migration** required  
✅ **Existing credits** continue to work for Futsal bookings  
✅ **New credits** will have explicit sport type  
✅ **Gradual transition** as old credits expire naturally

