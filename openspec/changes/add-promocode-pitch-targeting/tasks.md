# Implementation Tasks

## 1. Data Model Updates

- [x] 1.1 Update `PromoCode` type in `types/data.ts` to include `targetPitches`, `targetSpecificPitches`, and `typeOfSports` fields

## 2. Validation Logic Updates

- [ ] 2.1 Update promo code validation in `components/BookingFormPage3PromoCode.vue` to check pitch targeting
- [ ] 2.2 Update promo code validation in `components/BookingFormPage3PromoCode.vue` to check sport type targeting
- [ ] 2.3 Ensure backward compatibility for promo codes without new fields

## 3. Discount Calculation Updates

- [ ] 3.1 Update `getDiscount` function in `composables/payment.ts` to respect pitch targeting when calculating discounts
- [ ] 3.2 Update `getDiscount` function in `composables/payment.ts` to respect sport type targeting when calculating discounts

## 4. Testing

- [ ] 4.1 Test promo code with pitch targeting enabled
- [ ] 4.2 Test promo code with sport type targeting
- [ ] 4.3 Test promo code with both pitch and sport type targeting
- [ ] 4.4 Test backward compatibility with existing promo codes (no new fields)
- [ ] 4.5 Test promo code with `targetSpecificPitches` set to false (should ignore pitch targeting)
