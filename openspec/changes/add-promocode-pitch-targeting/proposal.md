# Add Promo Code Pitch Targeting

## Why

Currently, promo codes can only be targeted by location and timeslot types. This limits the flexibility of promotional campaigns. Venue operators need the ability to create promo codes that are specific to certain pitches (courts) within a location and specific sports types, enabling more granular promotional strategies such as:

- Promoting specific courts that need higher utilization
- Offering sport-specific discounts (e.g., Pickleball-only promotions)
- Running targeted campaigns for new or renovated courts

## What Changes

- Add `targetPitches` field to promo code data model (array of pitch IDs)
- Add `targetSpecificPitches` field to promo code data model (boolean flag to enable/disable pitch targeting)
- Add `typeOfSports` field to promo code data model (array of sport types)
- Update promo code validation logic to check if selected timeslots match the targeted pitches (when `targetSpecificPitches` is true)
- Update promo code validation logic to check if selected timeslots match the targeted sport types
- Ensure backward compatibility with existing promo codes that don't have these fields

## Impact

- **Affected specs**: New capability `promo-code-validation`
- **Affected code**:
  - `components/BookingFormPage3PromoCode.vue` - Promo code validation component
  - `types/data.ts` - PromoCode type definition
  - `composables/payment.ts` - Discount calculation logic
  - `stores/promocodes.ts` - Promo code store (no changes needed, just data pass-through)
  - `server/api/promocodes.ts` - API endpoint (no changes needed, just data pass-through)
- **Database**: Firebase Realtime Database `/promocode` node will have new optional fields
- **Breaking changes**: None - new fields are optional and backward compatible

