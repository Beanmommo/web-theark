# Implementation Tasks - Add Sports Type to Credit Packages

## 1. Web-theark-multisports: Credit Package Purchase Flow

- [x] 1.1 Verify `stores/packages.ts` `getPackagesBySport()` correctly filters by `typeOfSports` field
- [x] 1.2 Verify `components/PackagePurchasePage1.vue` uses sport slug from route to filter packages
- [ ] 1.3 Add unit tests for package filtering by sports type

## 2. Web-theark-multisports: Booking Payment Flow - Credit Store

- [x] 2.1 Update `stores/credits.ts` `fetchUserCreditsAndRefunds()` to accept optional `sportType` parameter
- [x] 2.2 Add filtering logic to only return credit packages matching the sport type
- [x] 2.3 Ensure backward compatibility: default to showing all packages if no sport type provided
- [x] 2.4 Update `currentUserPackages` computed to respect sports type filtering

## 3. Web-theark-multisports: Booking Payment Flow - Shared Composable

- [x] 3.1 ~~Update `composables/useSharedBookingForm.ts` `getAvailablePackages()` to accept `sportType` parameter~~ (N/A - composable doesn't exist in web-theark-multisports)
- [x] 3.2 ~~Filter credit packages by `creditPackage.typeOfSports` matching the provided sport type~~ (N/A - handled in stores/credits.ts instead)
- [x] 3.3 ~~Update callers to pass the booking's sport type when calling `getAvailablePackages()`~~ (N/A - handled in BookingFormPage3.vue)

## 4. Web-theark-multisports: Credit Ledger Validation

- [x] 4.1 Update `composables/useCreditLedger.ts` `recordUsage()` to validate sport type
- [x] 4.2 Add validation to ensure credit package's `typeOfSports` matches booking's `typeOfSports`
- [x] 4.3 Add error handling for sport type mismatch

## 5. Admin-theark-new: Unpaid Booking Drawer

- [x] 5.1 Update `components/UnpaidBookingDrawer.vue` `fetchCustomerCredits()` to filter by sport type
- [x] 5.2 Extract sport type from `slotDetails` (already available via `slot.typeOfSports`)
- [x] 5.3 Filter `availablePackages` to only include packages matching the booking's sport type
- [x] 5.4 Update credit balance display to show sport-specific available credits

## 6. Admin-theark-new: Shared Booking Form

- [x] 6.1 Update `composables/useSharedBookingForm.ts` `getAvailablePackages()` to accept `sportType` parameter
- [x] 6.2 Filter credit packages by `creditPackage.typeOfSports` matching the provided sport type
- [x] 6.3 Update callers to pass the booking's sport type when calling `getAvailablePackages()`

## 7. Testing

### 7.1 Package Purchase Flow

- [x] 7.1.1 Test: verify only Futsal packages shown on `/futsal/packages`
- [x] 7.1.2 Test: verify only Pickleball packages shown on `/pickleball/packages`

### 7.2 Booking Payment Flow

- [x] 7.2.1 Test: verify only matching credit packages available for selection
- [x] 7.2.2 Test: verify credit validation rejects mismatched sport types
- [x] 7.2.3 Test: verify total credit balance only includes matching packages

### 7.3 Admin Unpaid Booking

- [x] 7.3.1 Test: verify only matching credit packages shown in drawer
- [x] 7.3.2 Test: verify credit balance display shows sport-specific totals

### 7.4 Backward Compatibility (Critical!)

- [x] 7.4.1 Test: verify existing purchased packages without `typeOfSports` default to "futsal"
- [x] 7.4.2 Test: verify legacy packages appear in Futsal booking payment options
- [x] 7.4.3 Test: verify legacy packages do NOT appear in Pickleball booking payment options
- [x] 7.4.4 Test: verify legacy packages can be used for Futsal bookings
- [x] 7.4.5 Test: verify legacy packages are rejected for Pickleball bookings
- [x] 7.4.6 Test: verify mixed environment (old + new packages) calculates correct totals

### 7.5 Edge Cases

- [x] 7.5.1 Test: verify behavior when user has credits for multiple sports
- [x] 7.5.2 Test: verify behavior when user has no credits for the booking sport
- [x] 7.5.3 Test: verify behavior when all user credits are for different sport

## 8. Documentation

- [x] 8.1 Update inline code comments explaining sports type filtering logic
- [x] 8.2 Document the default behavior for legacy packages without `typeOfSports`
