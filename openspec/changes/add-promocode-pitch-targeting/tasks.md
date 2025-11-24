# Implementation Tasks

## 1. Data Model Updates

- [x] 1.1 Update `PromoCode` type in `types/data.ts` to include `targetPitches`, `targetSpecificPitches`, and `typeOfSports` fields

## 2. Validation Logic Updates

- [x] 2.1 Update promo code validation in `components/BookingFormPage3PromoCode.vue` to check pitch targeting
- [x] 2.2 Update promo code validation in `components/BookingFormPage3PromoCode.vue` to check sport type targeting
- [x] 2.3 Ensure backward compatibility for promo codes without new fields

## 3. Discount Calculation Updates

- [x] 3.1 Update `getDiscount` function in `composables/payment.ts` to respect pitch targeting when calculating discounts
- [x] 3.2 Update `getDiscount` function in `composables/payment.ts` to respect sport type targeting when calculating discounts

## 4. Testing

- [x] 4.1 Test promo code with pitch targeting enabled
- [x] 4.2 Test promo code with sport type targeting
- [x] 4.3 Test promo code with both pitch and sport type targeting
- [x] 4.4 Test backward compatibility with existing promo codes (no new fields)
- [x] 4.5 Test promo code with `targetSpecificPitches` set to false (should ignore pitch targeting)

**Note**: Manual testing should be performed using the development server at http://localhost:3000/
Test with the promo code data from `the-ark-2f5fe-default-rtdb--OeoGqrV0WQbWLtlnmzJ-export.json`
