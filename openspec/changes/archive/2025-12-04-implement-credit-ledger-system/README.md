# Credit Ledger System - Customer Website

## Quick Links

- **[Proposal](./proposal.md)** - Customer benefits and transparency features
- **[Design](./design.md)** - Integration with booking flow and UI design
- **[Tasks](./tasks.md)** - Implementation checklist with time estimates

## Status

- ✅ **Foundation Complete** - Types, APIs, composable implemented
- 🔲 **Integration Pending** - Need to integrate with booking flow
- 🔲 **UI Pending** - Transaction history page (optional)

## What's Been Done

### Completed (Foundation)
- ✅ Type definitions added to `types/data.ts`
- ✅ API endpoints (4 endpoints for transactions and allocations)
- ✅ Core composable with FIFO logic (`composables/useCreditLedger.ts`)

### Next Steps (Integration)
1. Integrate ledger into `BookingFormPage3.vue`
2. Add error handling for insufficient credits
3. Test booking flow with ledger
4. (Optional) Create transaction history page
5. (Optional) Show package breakdown during booking

## Key Features

- **Automatic FIFO**: System uses oldest packages first
- **Transparent Usage**: Customers see which packages were used
- **Transaction History**: Complete history of credit movements
- **Accurate Balances**: Real-time balance from ledger
- **Error Handling**: Clear messages for insufficient credits

## Time Estimate

- **Completed**: ~8-10 hours
- **Remaining (Core)**: ~25-38 hours (~1 week)
  - Integration: ~7-10 hours
  - Testing: ~12-18 hours
  - Documentation: ~4-6 hours
  - Deployment: ~2-4 hours
- **Remaining (With UI)**: ~36-54 hours (~1.5 weeks)
  - Add Transaction History: +11-16 hours

## Files Created

### New Files (5)
- `server/api/creditTransactions/index.post.ts`
- `server/api/creditTransactions/[userKey].get.ts`
- `server/api/packageAllocations/index.post.ts`
- `server/api/packageAllocations/transaction/[transactionId].get.ts`
- `composables/useCreditLedger.ts`

### Optional New Files (1)
- `pages/profile/creditHistory.vue` (transaction history page)

### Modified Files (2-3)
- `types/data.ts` (added new types)
- `components/BookingFormPage3.vue` (integration point)
- `stores/credits.ts` (optional balance updates)

## Integration Point

### BookingFormPage3.vue (around line 300)

**Before**:
```typescript
if (paymentMethod.value === PaymentMethods.MEMBERSHIP_CREDIT) {
  const creditPackageKeys = await updateCreditPackages();
  const creditReceiptKey = await creditsStore.addCreditReceipt(...);
  // ... continue booking
}
```

**After**:
```typescript
if (paymentMethod.value === PaymentMethods.MEMBERSHIP_CREDIT) {
  const availablePackages = creditsStore.currentUserPackages.filter(
    pkg => pkg.creditsLeft > 0 && !isExpired(pkg.expiryDate)
  );
  
  // Record in ledger FIRST
  const creditLedger = useCreditLedger();
  try {
    await creditLedger.recordUsage(
      customerData.value.userId,
      customerData.value.email,
      customerData.value.name,
      customerData.value.contact,
      presaleData.value.totalPayable,
      availablePackages,
      bookingKey,
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
  const creditPackageKeys = await updateCreditPackages();
  const creditReceiptKey = await creditsStore.addCreditReceipt(...);
  // ... continue booking
}
```

## Testing Checklist

- [ ] Test booking with single package
- [ ] Test booking with multiple packages (FIFO)
- [ ] Test insufficient credits error message
- [ ] Test with expired packages (excluded)
- [ ] Verify transactions created in Firestore
- [ ] Verify allocations created in Firestore
- [ ] Test transaction history page (if implemented)

## Customer Benefits

- ✅ **Transparency**: See exactly which packages were used
- ✅ **Accuracy**: Correct credit deductions every time
- ✅ **History**: View all credit transactions
- ✅ **Trust**: Complete audit trail of credit usage
- ✅ **Clarity**: Clear error messages when insufficient credits

## Optional Features

### Transaction History Page
- Timeline view of all transactions
- Filter by transaction type
- Show running balance
- View package breakdown for each transaction
- Export to PDF/Excel

**Estimated time**: +11-16 hours

## Documentation

See the main proposal document for:
- Customer-facing benefits
- Integration details
- UI mockups and designs
- Error handling strategies
- Performance considerations

## Questions?

Contact the development team or refer to the detailed documentation in this folder.

