# Add Database Version Field to Presale Type

## Why

The payment server needs to know which database to retrieve and update when processing presale transactions. Currently, the system is migrating from Firebase Realtime Database (RTDB) to Firestore, and both databases are in use during the transition period. Without a database version indicator, the payment server cannot determine which database contains the presale data.

## What Changes

- Add a new `databaseVersion` field to the `Presale` type with possible values: `'rtdb'` or `'firestore'`
- Update presale creation logic to include the `databaseVersion` field
- The field is stored in Firestore and can be read by the payment server when processing PayNow payments
- Maintain backward compatibility with existing presales that don't have this field

**Note**: This field is only relevant for PayNow payments processed by the external payment server. Stripe credit card payments are handled entirely within this application and do not require this field.

## Impact

- **Affected specs**: `payment-processing` (new capability)
- **Affected code**:
  - `types/data.ts` - Add `databaseVersion` field to `Presale` and `Invoice` types
  - `stores/presales.ts` - Include `databaseVersion: 'firestore'` when creating presales
  - `server/api/presales/index.ts` - Ensure field is persisted to Firestore
  - Payment server (external) - Will read this field from Firestore to determine database source for PayNow payments

## Migration Strategy

- **Phase 1**: Add optional `databaseVersion` field to types
- **Phase 2**: Update presale creation to set `databaseVersion: 'firestore'` for new presales
- **Phase 3**: Payment server updated to check `databaseVersion` field and default to RTDB if not present (backward compatibility)
- **Phase 4**: After full migration, make field required and remove RTDB fallback
