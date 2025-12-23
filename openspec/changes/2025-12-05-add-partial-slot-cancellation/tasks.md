# Partial Slot Cancellation - Tasks (Customer Website)

## Prerequisites

- [ ] Review existing booking cancellation flow in `stores/bookings.ts`
- [ ] Review credit ledger implementation in `composables/useCreditLedger.ts`
- [ ] Review booking details display in profile section
- [ ] Understand 72-hour calculation with Day.js

## Phase 1: Type Definitions

### Task 1.1: Update Booking Type
**File**: `types/data.ts`

- [ ] Add `cancelledSlots?: string[]` field to `Booking` type
- [ ] Add `refundAmount?: number` field to `Booking` type
- [ ] Add `partialCancellations?: PartialCancellation[]` field
- [ ] Create `PartialCancellation` type:
  ```typescript
  export type PartialCancellation = {
    slotKey: string;
    slotRate: number;
    cancelledDate: string;
    cancelledBy: string;
    creditRefundKey?: string;
  };
  ```

### Task 1.2: Update Credit Transaction Type
**File**: `types/data.ts`

- [ ] Add `'PARTIAL_REFUND'` to `CreditTransactionType` union

## Phase 2: API Endpoint

### Task 2.1: Create Cancel Slot Endpoint
**File**: `server/api/bookings/[id]/cancel-slot.post.ts`

- [ ] Create endpoint that accepts `{ slotKey: string }`
- [ ] Get authenticated user from session
- [ ] Fetch booking by ID
- [ ] Validate booking belongs to user
- [ ] Fetch slot data by slotKey
- [ ] **Validate 72-hour rule**:
  ```typescript
  const slotDateTime = dayjs(`${slot.date} ${slot.start}`);
  const hoursUntil = slotDateTime.diff(dayjs(), 'hour');
  if (hoursUntil < 72) {
    return { error: 'Cannot delete slots within 72 hours of booking time' };
  }
  ```
- [ ] Check if this is the last slot
- [ ] Return slot data for client-side processing

## Phase 3: Business Logic

### Task 3.1: Create Partial Cancellation Composable
**File**: `composables/usePartialCancellation.ts`

- [ ] Create `canDeleteSlot(slot: BookedSlot): boolean` function (72-hour check)
- [ ] Create `cancelSlot(bookingKey: string, slotKey: string)` function
- [ ] Implement flow:
  1. Validate 72-hour rule client-side
  2. Fetch slot data
  3. Check if last slot → call existing `cancelBooking()` flow
  4. Delete from Automate system
  5. Move slot to `cancelledSlots` collection (Firestore)
  6. Delete from `bookedSlots`
  7. Update booking document
  8. Create `creditRefund` with `amount = slot.rate`
  9. Record `PARTIAL_REFUND` in credit ledger
- [ ] Return result with `refundAmount` and `creditRefundKey`

### Task 3.2: Update Credit Ledger
**File**: `composables/useCreditLedger.ts`

- [ ] Add `recordPartialRefund()` method
- [ ] Include `slotKey` in transaction metadata
- [ ] Set transaction type to `'PARTIAL_REFUND'`

## Phase 4: UI Components

### Task 4.1: Update Booking Details View
**Location**: Profile booking details component

- [ ] List all slots with details (date, time, pitch, rate)
- [ ] Add "Delete" button for each slot
- [ ] Disable button if slot is within 72 hours
- [ ] Show tooltip on disabled button: "Cannot delete within 72 hours"
- [ ] Show visual indicator for deletable vs non-deletable slots

### Task 4.2: Create Delete Confirmation Dialog
**File**: `components/profile/SlotDeleteDialog.vue` (or inline)

- [ ] Show slot details being deleted
- [ ] Show refund amount (`slot.rate`)
- [ ] Show note: "Refund will be credited to your account"
- [ ] Show warning: "This action cannot be undone"
- [ ] Confirm/Cancel buttons
- [ ] Loading state during API call
- [ ] Success message with refund amount
- [ ] Error handling

### Task 4.3: Handle Last Slot Case
- [ ] Detect when deleting last slot
- [ ] Show different dialog: "This is your last slot. Deleting it will cancel the entire booking."
- [ ] If confirmed, trigger full cancellation flow
- [ ] Redirect to bookings list after full cancellation

### Task 4.4: Update Booking Display
- [ ] Show `refundAmount` if > 0 (e.g., "Refunded: $60")
- [ ] Show cancelled slots section if applicable
- [ ] Update any balance calculations

## Phase 5: Testing

### Task 5.1: Manual Testing
- [ ] Delete slot that is 72+ hours away → should succeed
- [ ] Try to delete slot within 72 hours → should be blocked
- [ ] Verify refund amount equals slot.rate
- [ ] Verify credit balance updated
- [ ] Verify slot removed from Automate
- [ ] Verify booking record updated correctly

### Task 5.2: Edge Case Testing
- [ ] Slot exactly at 72-hour boundary
- [ ] Delete last slot → verify full cancellation
- [ ] Multiple deletions on same booking
- [ ] Booking with applied discount

## Completion Checklist

- [ ] Type definitions updated
- [ ] API endpoint with 72-hour validation
- [ ] Composable logic complete
- [ ] UI shows deletable/non-deletable slots
- [ ] Confirmation dialog working
- [ ] Last slot triggers full cancellation
- [ ] Credit refund created
- [ ] Credit transaction recorded
- [ ] Automate sync working
- [ ] Manual testing passed

