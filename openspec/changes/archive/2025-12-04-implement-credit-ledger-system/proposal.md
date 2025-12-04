# Credit Ledger System - Change Proposal (Customer Website)

## Why

The customer website currently uses credits for bookings but lacks:

- Transparency into which packages were used for each booking
- Detailed transaction history for customers
- Accurate tracking when multiple packages are used in a single booking
- Proper refund tracking when bookings are cancelled

This leads to:

- Customer confusion about credit usage
- Support queries about "where did my credits go?"
- Inability to show customers their credit transaction history
- Trust issues when credits don't match expectations

## What Changes

Integrate the **Credit Ledger System** into the customer booking flow to:

1. **Record all credit transactions** when customers book with credits
2. **Use FIFO allocation** to automatically select which packages to use
3. **Provide transaction history** so customers can see all credit movements
4. **Ensure accurate refunds** when bookings are cancelled

### Key Features

- **Automatic FIFO**: System automatically uses oldest packages first
- **Transparent Usage**: Customers can see which packages were used
- **Transaction History**: Complete history of purchases, usage, and refunds
- **Accurate Balances**: Real-time balance calculated from ledger

### User Flow

#### Package Purchase (PRIMARY FLOW)

1. Customer browses credit packages on website
2. Customer selects package and proceeds to checkout
3. Payment processed (Stripe/PayNow)
4. **NEW**: System creates CreditTransaction (PURCHASE)
5. **NEW**: System creates PackageAllocation
6. System creates credit package in `creditPackages` collection
7. Customer receives email receipt
8. **NEW**: Transaction appears in customer's history

#### Booking with Credits

1. Customer selects slots and proceeds to payment
2. Customer selects "Membership Credit" as payment method
3. System shows available credit balance
4. Customer confirms booking
5. **NEW**: System records transaction and allocations using Priority Allocation (refunds first, then FIFO)
6. **NEW**: System updates package balances
7. Customer receives confirmation email (existing)
8. **NEW**: Customer can view transaction in history

#### Viewing Transaction History (New Feature)

1. Customer navigates to Profile → Credit History
2. System displays all credit transactions:
   - Package purchases
   - Booking usage (with package breakdown)
   - Refunds from cancellations
3. Customer can see running balance over time
4. Customer can filter by transaction type

#### Booking Cancellation

1. Customer cancels booking from profile
2. **NEW**: System creates refund transaction
3. **NEW**: System returns credits to original packages
4. Customer sees updated balance
5. **NEW**: Refund appears in transaction history

### Technical Implementation

#### New Types

- Added to `types/data.ts`:
  - `CreditTransaction` type
  - `PackageAllocation` type

#### New API Endpoints

- `POST /api/creditTransactions` - Create transaction
- `GET /api/creditTransactions/:userKey` - Get user transactions
- `POST /api/packageAllocations` - Create allocation
- `GET /api/packageAllocations/transaction/:transactionId` - Get allocations

#### New Composable

- `composables/useCreditLedger.ts` - Ledger logic with FIFO

#### New Page (Optional)

- `pages/profile/creditHistory.vue` - Transaction history page

#### Modified Files

- `components/BookingFormPage3.vue` - Integrate ledger on booking
- `stores/credits.ts` - May need updates for balance display

## Impact

### Affected Specs

- `booking-time-selection` (updated to use ledger)
- `profile-bookings-management` (add credit history)

### New Files (5 files)

- `server/api/creditTransactions/index.post.ts`
- `server/api/creditTransactions/[userKey].get.ts`
- `server/api/packageAllocations/index.post.ts`
- `server/api/packageAllocations/transaction/[transactionId].get.ts`
- `composables/useCreditLedger.ts`

### Optional New Files (1 file)

- `pages/profile/creditHistory.vue` - Transaction history page

### Modified Files (2-3 files)

- `types/data.ts` - Add new types
- `components/BookingFormPage3.vue` - Integrate ledger
- `stores/credits.ts` - (Optional) Update balance logic

### Breaking Changes

None - this is additive. Existing booking flow remains functional.

### Dependencies

- **Firestore**: Uses same collections as admin portal
- **Existing Stores**: `useCreditsStore`, `useBookingsStore`
- **Date Library**: Day.js (already installed)

### User Experience Impact

- **Positive**: Transparency into credit usage
- **Positive**: Transaction history for customers
- **Positive**: Accurate refunds
- **Neutral**: No visible changes to booking flow initially
- **Future**: Can show package breakdown during booking

### Performance Impact

- **Writes**: Additional writes for transactions and allocations
- **Reads**: Fast balance queries from ledger
- **User-facing**: No noticeable performance impact

## Testing Considerations

### Manual Testing

1. Book with single package → Verify transaction created
2. Book with multiple packages → Verify FIFO allocation
3. Cancel booking → Verify refund transaction
4. View transaction history → Verify all transactions shown
5. Check balance accuracy → Compare with package totals

### Edge Cases

- Insufficient credits (should show error)
- Expired packages (should be excluded)
- Concurrent bookings
- Network failures during transaction creation

## Success Metrics

- 100% of credit bookings recorded in ledger
- Zero customer complaints about credit discrepancies
- Increased customer trust (measurable through surveys)
- Reduced support queries about credits
- Transaction history page usage
