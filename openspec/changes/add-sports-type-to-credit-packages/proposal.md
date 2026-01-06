# Add Sports Type to Credit Packages

## Why

Currently in admin-theark-new, credit packages are configured with sports type filtering (via the `typeOfSports` field in `PackageDetails`). However, in web-theark-multisports, the credit package purchase flow and booking payment flow do not filter credit packages by sports type. This creates several issues:

1. **Incorrect package display**: When users purchase credit packages on a sport-specific page (e.g., `/futsal/packages`), they see packages for all sports, not just the current sport
2. **Booking payment confusion**: During booking checkout, users see all their credit packages regardless of whether they match the sport being booked
3. **Data inconsistency**: The admin system supports sports-specific packages, but the customer-facing website doesn't respect this configuration

This misalignment can lead to users purchasing the wrong packages or attempting to use incompatible credits for bookings.

## What Changes

### Credit Package Purchase Flow

- **Package listing page**: Filter displayed packages by the current sport slug from the route (e.g., `/futsal/packages` shows only Futsal packages)
- **Package store**: Add `getPackagesBySport()` method to filter packages by `typeOfSports` field
- **Backward compatibility**: Default to "futsal" for packages without `typeOfSports` field (legacy data)

### Booking Payment Flow

- **Credit package selection**: Filter available credit packages to only show those matching the booking's sport type
- **Credit validation**: Ensure credit packages used for payment match the sport being booked
- **Admin booking drawer**: Apply same sports type filtering when processing unpaid bookings

### Data Model

- **No schema changes required**: The `PackageDetails` type already includes `typeOfSports: string` field
- **No API changes required**: Existing endpoints already pass through the `typeOfSports` field
- **Backward compatibility for purchased packages**: Existing `CreditPackage` records in the database do not have `typeOfSports` in their nested `creditPackage.typeOfSports` field and SHALL default to "futsal" when filtering

## Impact

### Affected Specs

- New capability: `credit-package-management` - Requirements for credit package purchase and usage with sports type filtering

### Affected Code

#### Web-theark-multisports (Customer Website)

- `stores/packages.ts` - Already has `getPackagesBySport()` filtering by `typeOfSports`
- `components/PackagePurchasePage1.vue` - Already uses `getPackagesBySport()` with sport slug
- `stores/credits.ts` - Add sports type filtering in `fetchUserCreditsAndRefunds()`
- `composables/useSharedBookingForm.ts` - Add sports type filtering in `getAvailablePackages()`
- `composables/useCreditLedger.ts` - Validate sports type when recording credit usage

#### Admin-theark-new (Admin Portal)

- `components/UnpaidBookingDrawer.vue` - Add sports type filtering when fetching customer credits
- `composables/useSharedBookingForm.ts` - Add sports type filtering in `getAvailablePackages()`

### Breaking Changes

None - this is an additive change that adds filtering logic.

### Backward Compatibility

- **New package definitions**: Packages in the `/packages` collection already have `typeOfSports` field (configured in admin portal)
- **Purchased credit packages**: Existing `CreditPackage` records in `/creditPackages` collection do NOT have `typeOfSports` in their nested `creditPackage.typeOfSports` field
- **Default behavior**: All filtering logic SHALL treat missing `typeOfSports` as "futsal" to ensure existing purchased credits remain usable
- **Migration**: No data migration required - existing credits will continue to work for Futsal bookings

### User Experience Impact

- **Improved clarity**: Users only see relevant packages for the sport they're booking
- **Reduced errors**: Prevents users from purchasing or using incompatible credit packages
- **Consistent behavior**: Aligns customer website with admin portal configuration
