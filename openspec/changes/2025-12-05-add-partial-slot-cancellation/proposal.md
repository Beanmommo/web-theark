# Partial Slot Cancellation - Change Proposal (Customer Website)

## Why

Customers who book multiple time slots sometimes need to cancel only some slots, not the entire booking. Currently, the only option is to cancel the whole booking.

### Current Problem

A customer books 3 slots for a group session:
- Slot 1: 9am-10am ($50)
- Slot 2: 10am-11am ($60)  
- Slot 3: 11am-12pm ($70)

One person drops out, so they only need 2 slots. Current options:
1. Keep all 3 slots and waste money
2. Cancel entire booking, lose all slots, rebook

Neither option is customer-friendly.

### Desired Behavior

1. Customer goes to "My Bookings" in profile
2. Views booking details with all slots listed
3. Clicks "Delete" on the slot they don't need
4. Receives credit refund for that slot
5. Remaining slots stay booked

## What Changes

Implement a **Partial Slot Cancellation** feature for customers with a 72-hour restriction.

### Key Features

- **Immutable Original Totals**: Booking totals remain unchanged
- **Refund Tracking**: `refundAmount` field tracks cumulative refunds
- **72-Hour Rule**: Customers can only delete slots 72+ hours before slot date
- **Two Distinct Flows**: "Cancel Booking" (existing) vs "Delete Time Slot" (new)
- **Last Slot Handling**: Deleting last slot triggers full cancellation

### Business Rules

| Rule | Value |
|------|-------|
| Refund amount | `slot.rate` (GST is not refundable) |
| Customer time restriction | 72 hours before slot date |
| Last slot behavior | Triggers full "Cancel Booking" flow |
| Automate sync | Deleted slots removed from Automate system |

### User Flow

#### Delete Time Slot (Customer)

1. Customer navigates to Profile → My Bookings
2. Customer selects a booking to view details
3. Each slot shows "Delete" button (enabled if 72+ hours away)
4. Customer clicks "Delete" on desired slot
5. Confirmation dialog shows:
   - Slot details (date, time, pitch)
   - Refund amount (slot.rate, no GST)
   - Warning that this cannot be undone
6. Customer confirms deletion
7. System processes partial cancellation:
   - Removes slot from Automate system
   - Moves slot to `cancelledSlots` collection
   - Deletes slot from `bookedSlots`
   - Updates booking record
   - Creates `creditRefund` for customer
   - Records `PARTIAL_REFUND` transaction
8. Success message: "Slot deleted. $XX credited to your account."

#### 72-Hour Restriction

For slots within 72 hours of booking date:
- "Delete" button is disabled
- Tooltip shows: "Slots cannot be deleted within 72 hours of booking time"
- Customer must contact support for exceptions

#### Edge Case: Last Slot

If customer deletes the last remaining slot:
1. System shows different confirmation: "This is your last slot. Deleting it will cancel the entire booking."
2. Customer confirms
3. System triggers existing "Cancel Booking" flow
4. Full booking cancelled with appropriate refund

### Technical Implementation

#### Type Changes

**Booking Type** (in `types/data.ts`):
```typescript
export type Booking = CustomerDetails & CostData & {
  // Existing fields...
  slots: string[];
  
  // NEW FIELDS
  cancelledSlots?: string[];
  refundAmount?: number;
  partialCancellations?: PartialCancellation[];
};

export type PartialCancellation = {
  slotKey: string;
  slotRate: number;
  cancelledDate: string;
  cancelledBy: string;
  creditRefundKey?: string;
};
```

**CreditTransactionType**:
```typescript
export type CreditTransactionType = 
  | 'PURCHASE' 
  | 'USAGE' 
  | 'REFUND' 
  | 'PARTIAL_REFUND'  // NEW
  | 'ADJUSTMENT' 
  | 'EXPIRY';
```

#### New API Endpoint

- `POST /api/bookings/[id]/cancel-slot` - Cancel individual slot with 72-hour validation

#### Validation Logic

```typescript
function canDeleteSlot(slot: BookedSlot): boolean {
  const slotDateTime = dayjs(`${slot.date} ${slot.start}`, 'YYYY-MM-DD h:mma');
  const now = dayjs();
  const hoursUntilSlot = slotDateTime.diff(now, 'hour');
  return hoursUntilSlot >= 72;
}
```

## Impact

### Affected Specs

- `profile-bookings-management` (add delete slot capability)

### New Files (2-3 files)

- `server/api/bookings/[id]/cancel-slot.post.ts`
- `composables/usePartialCancellation.ts`
- `components/profile/SlotDeleteDialog.vue` (optional)

### Modified Files (3-4 files)

- `types/data.ts` - Add new fields and types
- `components/profile/BookingDetails.vue` or similar - Add delete button
- `composables/useCreditLedger.ts` - Add recordPartialRefund method

### Breaking Changes

None - this is additive. Existing flows unchanged.

### Dependencies

- **Credit Ledger**: Uses `creditRefunds` and `creditTransactions` collections
- **Automate API**: For slot deletion  
- **Day.js**: For 72-hour calculation
- **Auth**: Customer must be logged in

### User Experience Impact

- **Positive**: Flexibility to modify bookings
- **Positive**: Instant credit refunds for cancelled slots
- **Positive**: Clear feedback on what can/cannot be deleted
- **Neutral**: Slight complexity in booking details view

## Testing Considerations

### Manual Testing

1. Delete slot 72+ hours away → Should succeed
2. Try to delete slot within 72 hours → Should be blocked
3. Delete all slots one by one → Last one triggers full cancellation
4. Verify refund amount matches slot.rate (no GST)
5. Check credit balance updated correctly
6. Verify slot removed from Automate

### Edge Cases

- Slot exactly at 72-hour boundary
- Multiple slots on same day (some deletable, some not)
- Booking with discount (refund still uses individual slot.rate)
- Network failure during cancellation

## Success Metrics

- Customer adoption of partial cancellation feature
- Reduced full booking cancellations
- Reduced support tickets for slot modifications
- Customer satisfaction with refund transparency

