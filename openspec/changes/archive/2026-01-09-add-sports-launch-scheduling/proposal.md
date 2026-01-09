# Add Sports Launch Scheduling

## Why

Currently, sports are hardcoded in `stores/sports.ts`, requiring code deployments to launch new sports subsites. There's no way to schedule when a sport page goes live or when booking becomes available, making coordinated launches difficult.

To support scheduled launches of new sports (e.g., Badminton, Tennis), we need to:
1. Fetch sports configuration from Firebase instead of hardcoding
2. Implement date-based visibility controls for sport pages and booking
3. Show "Coming Soon" states when sports are visible but booking is not yet enabled

## What Changes

- Update `Sport` type to include scheduling fields from Firebase config
- Modify `useSportsStore` to fetch sports from Firebase config instead of hardcoded array
- Add date-based filtering to show/hide sports based on `websiteStartDate`
- Add `isBookingEnabled()` method to check if booking is available based on `websitePublishDate`
- Update Quick Booking component to show "Coming Soon" when booking is disabled
- Update booking page to show "Coming Soon" banner when booking is disabled
- Add computed properties for booking launch dates to display to users
- Maintain backward compatibility with existing pitch filtering logic

## Impact

- **Affected specs**: 
  - New capability: `sports-configuration`
  - Modified: `booking-time-selection` (booking availability check)
  - Modified: `venue-display` (sports filtering)
- **Affected code**:
  - `web-theark-multisports/types/sport.ts` - Type definitions
  - `web-theark-multisports/stores/sports.ts` - Sports store (major refactor)
  - `web-theark-multisports/components/SectionQuickBooking.vue` - Coming soon state
  - `web-theark-multisports/pages/[sportSlug]/booking/index.vue` - Coming soon banner
  - `web-theark-multisports/stores/config.ts` - Config fetching (if not exists)
- **Breaking changes**: None - existing sports will work with default values
- **Dependencies**: Requires corresponding admin-theark-new changes to configure sports
- **Migration**: Existing hardcoded sports (Futsal, Pickleball) need to be migrated to Firebase config

