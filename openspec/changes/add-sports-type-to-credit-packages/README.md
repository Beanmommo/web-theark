# Add Sports Type to Credit Packages - OpenSpec Proposal

## Overview

This proposal adds sports type filtering to credit package purchase and usage flows in web-theark-multisports, ensuring that users only see and can use credit packages that match the sport they're booking.

## Problem Statement

Currently, the admin portal (admin-theark-new) supports configuring credit packages with specific sports types (Futsal, Pickleball, etc.), but the customer-facing website (web-theark-multisports) doesn't respect this configuration. This leads to:

- Users seeing all packages regardless of the sport page they're on
- Users attempting to use incompatible credits for bookings
- Confusion and potential errors in the booking flow

## Solution

Add sports type filtering at three key points:

1. **Package Purchase Page** - Filter packages by sport when displaying on `/[sport]/packages`
2. **Booking Payment Flow** - Show only matching credit packages during checkout
3. **Admin Unpaid Booking** - Filter credits by sport when processing payments

## Key Features

✅ **No Breaking Changes** - Fully backward compatible with existing data
✅ **No Schema Changes** - Uses existing `typeOfSports` field in `PackageDetails`
✅ **No API Changes** - Existing endpoints already support the field
✅ **Backward Compatible** - Existing purchased credits without `typeOfSports` default to "futsal"
✅ **No Migration Required** - Legacy credits continue to work for Futsal bookings

## Files in This Proposal

- **proposal.md** - Detailed explanation of why, what, and impact
- **tasks.md** - Step-by-step implementation checklist
- **specs/credit-package-management/spec.md** - Formal requirements and scenarios
- **EXAMPLES.md** - Code examples and implementation patterns
- **README.md** - This file

## Quick Start

### For Reviewers

1. Read `proposal.md` to understand the problem and solution
2. Review `specs/credit-package-management/spec.md` for formal requirements
3. Check `EXAMPLES.md` for implementation details
4. Review the flow diagrams (rendered in the conversation)

### For Implementers

1. Read `proposal.md` and `specs/credit-package-management/spec.md`
2. Follow `tasks.md` step by step
3. Refer to `EXAMPLES.md` for code patterns
4. Mark tasks as complete in `tasks.md` as you go

## Validation Status

✅ Validated with `openspec validate add-sports-type-to-credit-packages --strict`

## Key Implementation Points

### 1. Package Purchase (Already Working!)

The package purchase flow already filters by sport type:

```typescript
// stores/packages.ts
const getPackagesBySport = (sportSlug: string) => {
  return packages.value.filter(
    (pkg) => (pkg.typeOfSports?.toLowerCase() ?? "futsal") === sportSlug
  );
};
```

**No changes needed here!**

### 2. Booking Payment (Needs Update)

Update credit fetching to filter by sport:

```typescript
// stores/credits.ts
const fetchUserCreditsAndRefunds = async (sportType?: string) => {
  // Filter packages by sportType
  const pkgSportType =
    pkg.creditPackage?.typeOfSports?.toLowerCase() ?? "futsal";
  if (sportType && pkgSportType !== sportType.toLowerCase()) {
    return; // Skip this package
  }
};
```

### 3. Admin Unpaid Booking (Needs Update)

Extract sport from slots and filter credits:

```typescript
// admin-theark-new/components/UnpaidBookingDrawer.vue
const bookingSportType = slotDetails.value[0]?.typeOfSports?.toLowerCase();
const availablePackages = allPackages.filter((pkg) => {
  const pkgSportType =
    pkg.creditPackage?.typeOfSports?.toLowerCase() ?? "futsal";
  return pkgSportType === bookingSportType;
});
```

## Testing Checklist

### Package Purchase

- [ ] Futsal packages only show on `/futsal/packages`
- [ ] Pickleball packages only show on `/pickleball/packages`

### Booking Payment

- [ ] Booking Futsal shows only Futsal credits
- [ ] Booking Pickleball shows only Pickleball credits
- [ ] Credit validation rejects mismatched sports

### Admin Portal

- [ ] Admin drawer filters credits by booking sport

### Backward Compatibility (Critical!)

- [ ] **Legacy purchased packages (no typeOfSports) default to "futsal"**
- [ ] **Legacy packages appear in Futsal booking payment**
- [ ] **Legacy packages do NOT appear in Pickleball booking payment**
- [ ] **Legacy packages can be used for Futsal bookings**
- [ ] **Mixed old + new packages calculate correct totals**

## Next Steps

1. **Review** - Get approval from stakeholders
2. **Create GitHub Issue** - Track implementation
3. **Create Feature Branch** - `feature/add-sports-type-to-credit-packages`
4. **Implement** - Follow tasks.md step by step
5. **Test** - Verify all scenarios
6. **Create PR** - Link to issue and proposal
7. **Archive** - After merge, archive this change

## Questions?

Refer to:

- `openspec/AGENTS.md` - OpenSpec workflow guide
- `openspec/project.md` - Project conventions
- This proposal's files for specific details
