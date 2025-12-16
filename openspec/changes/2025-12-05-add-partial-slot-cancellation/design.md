# Partial Slot Cancellation - Technical Design (Customer Website)

## Overview

This document describes the technical implementation for partial slot cancellation on the customer website, including the 72-hour restriction.

## Data Model Changes

### Booking Type Extensions

```typescript
// types/data.ts

export type Booking = CustomerDetails & CostData & {
  // Existing fields (IMMUTABLE after partial cancellation)
  subtotal: number;
  total: number;
  gst: number;
  discount: number;
  transactionFee: number;
  totalPayable: number;
  slots: string[];  // Active slot keys (mutable)
  
  // NEW FIELDS
  cancelledSlots?: string[];
  refundAmount?: number;
  partialCancellations?: PartialCancellation[];
};

export type PartialCancellation = {
  slotKey: string;
  slotRate: number;
  cancelledDate: string;
  cancelledBy: string;         // "customer" or email
  creditRefundKey?: string;
};

// Update CreditTransactionType
export type CreditTransactionType = 
  | 'PURCHASE' 
  | 'USAGE' 
  | 'REFUND' 
  | 'PARTIAL_REFUND'  // NEW
  | 'ADJUSTMENT' 
  | 'EXPIRY';
```

## 72-Hour Validation

### Client-Side Check

```typescript
// composables/usePartialCancellation.ts

import dayjs from 'dayjs';

/**
 * Check if a slot can be deleted (72+ hours before slot time)
 */
function canDeleteSlot(slot: BookedSlot): { 
  canDelete: boolean; 
  hoursUntil: number;
  reason?: string;
} {
  // Parse slot date and start time
  // Assuming slot.date is "YYYY-MM-DD" and slot.start is "9am" or "10:00am"
  const slotDateTime = dayjs(`${slot.date} ${slot.start}`, [
    'YYYY-MM-DD ha',
    'YYYY-MM-DD h:mma',
    'YYYY-MM-DD HH:mm'
  ]);
  
  const now = dayjs();
  const hoursUntil = slotDateTime.diff(now, 'hour');
  
  if (hoursUntil < 72) {
    return {
      canDelete: false,
      hoursUntil,
      reason: `Cannot delete slots within 72 hours of booking time. This slot is in ${hoursUntil} hours.`
    };
  }
  
  return { canDelete: true, hoursUntil };
}
```

### Server-Side Validation

```typescript
// server/api/bookings/[id]/cancel-slot.post.ts

export default defineEventHandler(async (event) => {
  const bookingId = getRouterParam(event, 'id');
  const { slotKey } = await readBody(event);
  
  // Get authenticated user
  const session = await getServerSession(event);
  if (!session?.user?.email) {
    return { status: 401, error: 'Unauthorized' };
  }
  
  // Fetch booking and validate ownership
  const booking = await fetchBooking(bookingId);
  if (booking.email !== session.user.email) {
    return { status: 403, error: 'Not authorized to modify this booking' };
  }
  
  // Fetch slot
  const slot = await fetchSlot(slotKey);
  
  // 72-hour validation
  const slotDateTime = dayjs(`${slot.date} ${slot.start}`);
  const hoursUntil = slotDateTime.diff(dayjs(), 'hour');
  
  if (hoursUntil < 72) {
    return { 
      status: 400, 
      error: 'Cannot delete slots within 72 hours of booking time' 
    };
  }
  
  // Process cancellation...
});
```

## API Design

### Cancel Slot Endpoint

```typescript
// server/api/bookings/[id]/cancel-slot.post.ts

// Request
POST /api/bookings/:bookingId/cancel-slot
{
  slotKey: string;
}
// Note: cancelledBy derived from session

// Response (Success)
{
  success: true,
  refundAmount: number,
  creditRefundKey: string,
  message: "Slot deleted. $XX credited to your account."
}

// Response (Last Slot)
{
  success: true,
  isLastSlot: true,
  message: "Booking cancelled. Full refund processed."
}

// Response (72-hour violation)
{
  status: 400,
  error: "Cannot delete slots within 72 hours of booking time"
}
```

## UI Components

### Slot List with Delete Buttons

```vue
<!-- components/profile/BookingSlotList.vue -->
<template>
  <div v-for="slot in slots" :key="slot.key" class="slot-item">
    <div class="slot-info">
      <span>{{ formatDate(slot.date) }}</span>
      <span>{{ slot.start }} - {{ slot.end }}</span>
      <span>Pitch {{ slot.pitch }}</span>
      <span>${{ slot.rate }}</span>
    </div>
    
    <v-btn
      v-if="canDeleteSlot(slot).canDelete"
      color="error"
      variant="text"
      @click="openDeleteDialog(slot)"
    >
      Delete
    </v-btn>
    
    <v-tooltip v-else location="top">
      <template #activator="{ props }">
        <v-btn v-bind="props" disabled variant="text">
          Delete
        </v-btn>
      </template>
      <span>{{ canDeleteSlot(slot).reason }}</span>
    </v-tooltip>
  </div>
</template>
```

### Delete Confirmation Dialog

```vue
<!-- components/profile/SlotDeleteDialog.vue -->
<template>
  <v-dialog v-model="show" max-width="400">
    <v-card>
      <v-card-title>Delete Time Slot</v-card-title>
      
      <v-card-text>
        <p><strong>Date:</strong> {{ formatDate(slot.date) }}</p>
        <p><strong>Time:</strong> {{ slot.start }} - {{ slot.end }}</p>
        <p><strong>Pitch:</strong> {{ slot.pitch }}</p>
        
        <v-divider class="my-4" />
        
        <p class="text-success">
          <strong>Refund Amount:</strong> ${{ slot.rate }}
        </p>
        <p class="text-caption">
          This amount will be credited to your account.
        </p>
        
        <v-alert type="warning" variant="tonal" class="mt-4">
          This action cannot be undone.
        </v-alert>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn @click="show = false">Cancel</v-btn>
        <v-btn color="error" :loading="loading" @click="confirmDelete">
          Delete Slot
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
```

## Sequence Diagram

```
Customer -> BookingDetails: View booking
BookingDetails -> UI: Show slots with delete buttons
UI -> canDeleteSlot(): Check 72-hour rule
canDeleteSlot -> UI: Return canDelete status

Customer -> DeleteButton: Click (if enabled)
DeleteButton -> Dialog: Show confirmation
Customer -> Dialog: Confirm delete

Dialog -> API: POST /bookings/{id}/cancel-slot
API -> Validation: Check 72-hour rule (server)
API -> Automate: Delete slot
API -> Firestore: Move to cancelledSlots
API -> DB: Delete from bookedSlots
API -> DB: Update booking
API -> Firestore: Create creditRefund
API -> Firestore: Create creditTransaction
API -> Dialog: Return success

Dialog -> Customer: "Slot deleted. $XX credited."
UI -> BookingDetails: Refresh booking data
```

## Error States

| Scenario | UI Behavior |
|----------|-------------|
| Slot within 72 hours | Delete button disabled with tooltip |
| Last slot | Show different dialog, trigger full cancel |
| Network error | Show error snackbar, allow retry |
| Auth expired | Redirect to login |

