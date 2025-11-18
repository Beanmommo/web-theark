# Old Website Implementation Summary

## Quick Reference

This document provides a quick summary for implementing `databaseVersion` in the old website.

## What to Do

Add a `databaseVersion` field to presale data in the old website with the value `'rtdb'`.

## Why

The external payment server needs to know which database (RTDB or Firestore) contains presale data. The new website uses Firestore and sets `databaseVersion: 'firestore'`. The old website uses RTDB and should set `databaseVersion: 'rtdb'`.

## Simple Implementation Steps

### Step 1: Find Presale Creation Code

Look for code that creates presale/booking records, likely something like:

```javascript
// Example - your actual code may differ
const presaleData = {
  id: presaleId,
  customerName: name,
  email: email,
  totalPayable: amount,
  // ... other fields
};

database.ref('presales/' + presaleId).set(presaleData);
```

### Step 2: Add the Field

Simply add `databaseVersion: 'rtdb'` to the presale data:

```javascript
const presaleData = {
  id: presaleId,
  customerName: name,
  email: email,
  totalPayable: amount,
  databaseVersion: 'rtdb', // ← ADD THIS LINE
  // ... other fields
};

database.ref('presales/' + presaleId).set(presaleData);
```

### Step 3: Update All Presale Creation Points

Make sure to add the field everywhere presales are created:
- Regular venue bookings
- Credit package purchases
- Any other presale types

### Step 4: Test

1. Create a test presale
2. Check RTDB to verify `databaseVersion: 'rtdb'` is saved
3. Test PayNow payment flow
4. Verify existing presales still work

## Important Notes

✅ **DO:**
- Set `databaseVersion: 'rtdb'` for all new presales
- Include the field for PayNow payments
- Keep the field optional for backward compatibility

❌ **DON'T:**
- Don't add this field to Stripe payment flows
- Don't migrate existing presales (not required)
- Don't make the field required (keep it optional)

## TypeScript Type (if applicable)

```typescript
type DatabaseVersion = 'rtdb' | 'firestore';

interface Presale {
  id: string;
  // ... other fields
  databaseVersion?: DatabaseVersion; // Optional field
}
```

## Comparison with New Website

| Item | New Website | Old Website |
|------|-------------|-------------|
| Database | Firestore | RTDB |
| Value | `'firestore'` | `'rtdb'` |
| Status | ✅ Implemented | ⏳ To implement |

## Files to Check/Modify

Look for files related to:
- Presale creation/submission
- Booking form handlers
- Package purchase handlers
- PayNow payment initialization
- Database write operations

Common file names might include:
- `presale.js` / `presales.js`
- `booking.js` / `bookings.js`
- `payment.js` / `payments.js`
- Form submission handlers
- API endpoints for creating presales

## Testing Checklist

- [ ] Find all presale creation code
- [ ] Add `databaseVersion: 'rtdb'` to presale data
- [ ] Test creating a new booking
- [ ] Verify field is saved to RTDB
- [ ] Test PayNow payment flow
- [ ] Verify old presales still work
- [ ] Document the changes

## Next Steps After Implementation

1. Deploy to old website
2. Verify presales include the field
3. Coordinate with payment server team to use the field
4. Monitor for any issues
5. Plan eventual migration to Firestore (future)

## Support

- Reference: New website implementation in `openspec/changes/add-presale-database-version/`
- PR: https://github.com/Beanmommo/web-theark/pull/4
- This document: `openspec-prompt-for-old-website.md`

