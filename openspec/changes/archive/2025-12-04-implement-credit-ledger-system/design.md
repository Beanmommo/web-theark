# Credit Ledger System - Technical Design (Customer Website)

## Architecture Overview

The website integrates with the same **two-level ledger architecture** as the admin portal:

- **Level 1: CreditTransaction** - Main ledger
- **Level 2: PackageAllocation** - Detail ledger

The website is primarily a **consumer** of the ledger system, recording transactions when customers book.

## Data Flow

### Booking with Credits Flow
```
Customer confirms booking with "Membership Credit"
    ↓
BookingFormPage3.vue - handleSubmit()
    ↓
Get user's available packages from creditsStore
    ↓
useCreditLedger.recordUsage()
    ↓
allocateCreditsFromPackages() [FIFO Algorithm]
    ↓
    ├─→ Sort packages by submittedDate (oldest first)
    ├─→ Allocate from oldest until booking amount satisfied
    └─→ Return array of allocations
    ↓
Create CreditTransaction via API
    ├─→ POST /api/creditTransactions
    └─→ Save to Firestore
    ↓
Create PackageAllocations via API
    ├─→ POST /api/packageAllocations (for each allocation)
    └─→ Save to Firestore
    ↓
Update package creditsLeft fields (existing logic)
    ↓
Create booking (existing logic)
    ↓
Show confirmation to customer
```

### Transaction History Flow (New Feature)
```
Customer navigates to Profile → Credit History
    ↓
Fetch user's transactions
    ├─→ GET /api/creditTransactions/:userKey
    └─→ Returns all transactions for user
    ↓
Sort by timestamp (newest first)
    ↓
Display in table/list
    ├─→ Show transaction type (icon/badge)
    ├─→ Show amount (+ or -)
    ├─→ Show running balance
    ├─→ Show description
    └─→ Show date/time
    ↓
User can click transaction to see details
    ├─→ Fetch allocations for transaction
    ├─→ GET /api/packageAllocations/transaction/:transactionId
    └─→ Show which packages were used
```

## Integration Points

### BookingFormPage3.vue

**Current Code** (around line 300):
```typescript
if (paymentMethod.value === PaymentMethods.MEMBERSHIP_CREDIT) {
  await creditsStore.fetchUserCreditsAndRefunds();
  const creditPackageData: InvoiceBooking = {
    ...presaleData.value,
    slotKeys,
    invoiceType: InvoiceType.BOOKING,
    paymentStatus: "Paid",
    submittedDate: dayjs().format(),
    typeOfSports: presaleData.value.typeOfSports?.toLowerCase() || "futsal",
    slots: presaleData.value.slots?.map((slot) => ({
      ...slot,
      typeOfSports: slot.typeOfSports?.toLowerCase() || "futsal",
    })),
  };
  
  const creditPackageKeys = await updateCreditPackages();
  const creditReceiptKey = await creditsStore.addCreditReceipt(
    creditPackageData,
    creditsStore.purchasedCreditsLeft,
    creditPackageKeys
  );
  
  // ... rest of booking creation
}
```

**New Code** (with ledger integration):
```typescript
if (paymentMethod.value === PaymentMethods.MEMBERSHIP_CREDIT) {
  await creditsStore.fetchUserCreditsAndRefunds();
  
  // Get available packages
  const availablePackages = creditsStore.currentUserPackages.filter(
    pkg => pkg.creditsLeft > 0 && !isExpired(pkg.expiryDate)
  );
  
  // Record in ledger BEFORE updating packages
  const creditLedger = useCreditLedger();
  try {
    await creditLedger.recordUsage(
      customerData.value.userId,
      customerData.value.email,
      customerData.value.name,
      customerData.value.contact,
      presaleData.value.totalPayable,
      availablePackages,
      bookingKey, // Will be generated
      slotKeys,
      presaleData.value.date,
      presaleData.value.location,
      presaleData.value.slots
    );
  } catch (error) {
    if (error.message.includes('Insufficient credits')) {
      paymentError.value = true;
      paymentErrorMessage.value = "Insufficient credits for this booking.";
      loading.value = false;
      return;
    }
    throw error;
  }
  
  // Continue with existing logic
  const creditPackageData: InvoiceBooking = { ... };
  const creditPackageKeys = await updateCreditPackages();
  const creditReceiptKey = await creditsStore.addCreditReceipt(...);
  
  // ... rest of booking creation
}
```

## API Endpoints

### POST /api/creditTransactions
Create a new credit transaction.

**Implementation**:
```typescript
import { fs } from "../../utils/firebase";
import type { CreditTransaction } from "~/types/data";

export default defineEventHandler(async (event) => {
  const transaction = await readBody<CreditTransaction>(event);
  
  const ref = fs.collection("creditTransactions");
  await ref.doc(transaction.id).set(transaction);
  
  return { success: true, id: transaction.id };
});
```

### GET /api/creditTransactions/:userKey
Fetch all transactions for a user.

**Implementation**:
```typescript
import { fs } from "../../utils/firebase";

export default defineEventHandler(async (event) => {
  const userKey = getRouterParam(event, "userKey");
  
  const ref = fs.collection("creditTransactions");
  const snapshot = await ref.where("userKey", "==", userKey).get();
  
  const transactions = {};
  snapshot.forEach((doc) => {
    transactions[doc.id] = doc.data();
  });
  
  return transactions;
});
```

### POST /api/packageAllocations
Create a new package allocation.

### GET /api/packageAllocations/transaction/:transactionId
Fetch allocations for a transaction.

## Composable: useCreditLedger

**Key Functions**:

```typescript
export const useCreditLedger = () => {
  const getCurrentBalance = async (userKey: string): Promise<number> => {
    // Fetch latest transaction and return balanceAfter
  };

  const allocateCreditsFromPackages = (
    amount: number,
    packages: CreditPackage[]
  ): AllocationInput[] => {
    // FIFO allocation algorithm
    // Returns array of { packageKey, amountUsed, ... }
  };

  const recordUsage = async (
    userKey: string,
    email: string,
    name: string,
    contact: string,
    amount: number,
    packages: CreditPackage[],
    bookingKey: string,
    slotKeys: string[],
    bookingDate: string,
    location: string,
    slots: any[]
  ): Promise<void> => {
    // 1. Get current balance
    // 2. Allocate credits using FIFO
    // 3. Create transaction
    // 4. Create allocations
  };

  return {
    getCurrentBalance,
    allocateCreditsFromPackages,
    recordUsage,
  };
};
```

## Transaction History Page (Optional)

### Page: pages/profile/creditHistory.vue

```vue
<script setup lang="ts">
import { useAuthUser } from "~/composables/useAuth";
import type { CreditTransaction } from "~/types/data";

const authUser = useAuthUser();
const transactions = ref<CreditTransaction[]>([]);
const isLoading = ref(true);

const fetchTransactions = async () => {
  if (!authUser.value?.uid) return;
  
  isLoading.value = true;
  try {
    const data = await $fetch(`/api/creditTransactions/${authUser.value.uid}`);
    transactions.value = Object.values(data).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchTransactions);

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'PURCHASE': return 'mdi-plus-circle';
    case 'USAGE': return 'mdi-minus-circle';
    case 'REFUND': return 'mdi-undo';
    default: return 'mdi-circle';
  }
};

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'PURCHASE': return 'success';
    case 'USAGE': return 'error';
    case 'REFUND': return 'info';
    default: return 'grey';
  }
};
</script>

<template>
  <div class="credit-history">
    <h1>Credit Transaction History</h1>
    
    <v-card v-if="isLoading">
      <v-card-text>Loading...</v-card-text>
    </v-card>
    
    <v-card v-else-if="transactions.length === 0">
      <v-card-text>No transactions found.</v-card-text>
    </v-card>
    
    <v-timeline v-else align="start">
      <v-timeline-item
        v-for="transaction in transactions"
        :key="transaction.id"
        :dot-color="getTransactionColor(transaction.type)"
        :icon="getTransactionIcon(transaction.type)"
      >
        <template #opposite>
          <div class="text-caption">
            {{ formatDate(transaction.timestamp) }}
          </div>
        </template>
        
        <v-card>
          <v-card-title>
            <v-chip :color="getTransactionColor(transaction.type)" size="small">
              {{ transaction.type }}
            </v-chip>
            <span class="ml-2">{{ transaction.description }}</span>
          </v-card-title>
          
          <v-card-text>
            <div class="d-flex justify-space-between">
              <div>
                <strong>Amount:</strong>
                <span :class="transaction.amount > 0 ? 'text-success' : 'text-error'">
                  {{ transaction.amount > 0 ? '+' : '' }}${{ Math.abs(transaction.amount) }}
                </span>
              </div>
              <div>
                <strong>Balance:</strong> ${{ transaction.balanceAfter }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>
```

## Error Handling

### Insufficient Credits
```typescript
try {
  await creditLedger.recordUsage(...);
} catch (error) {
  if (error.message.includes('Insufficient credits')) {
    paymentError.value = true;
    paymentErrorMessage.value = "You don't have enough credits for this booking.";
    return;
  }
  throw error;
}
```

### Network Failures
- Show error message to customer
- Allow retry
- Don't create booking if ledger recording fails

## Performance Considerations

- Ledger recording happens in parallel with existing booking flow
- Minimal impact on booking time (<100ms additional)
- Transaction history page loads on-demand
- Can add pagination if transaction count is high

## Security

- Uses existing Firebase authentication
- Customer can only see their own transactions
- API endpoints validate userKey matches authenticated user
- No sensitive data exposed

## Testing Strategy

### Manual Testing
1. Book with credits → Verify transaction created
2. View transaction history → Verify all transactions shown
3. Cancel booking → Verify refund transaction
4. Test with multiple packages → Verify FIFO
5. Test insufficient credits → Verify error shown

### Edge Cases
- Expired packages excluded from FIFO
- Concurrent bookings by same user
- Network failures during transaction creation
- Invalid package data

