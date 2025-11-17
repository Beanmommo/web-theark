# Add Database Version Field to Presale Type

## Why

The payment server needs to know which database to retrieve and update when processing presale transactions. Currently, the system is migrating from Firebase Realtime Database (RTDB) to Firestore, and both databases are in use during the transition period. Without a database version indicator, the payment server cannot determine which database contains the presale data.

## What Changes

- Add a new `databaseVersion` field to the `Presale` type with possible values: `'rtdb'` or `'firestore'`
- Update presale creation logic to include the `databaseVersion` field
- Ensure the field is passed to the payment server via Stripe metadata or presale data
- Maintain backward compatibility with existing presales that don't have this field

## Impact

- **Affected specs**: `payment-processing` (new capability)
- **Affected code**:
  - `types/data.ts` - Add `databaseVersion` field to `Presale` type
  - `stores/presales.ts` - Include `databaseVersion` when creating presales
  - `server/api/presales/index.ts` - Ensure field is persisted to Firestore
  - `server/api/stripe/secret.post.ts` - Pass `databaseVersion` in payment intent metadata
  - Payment server (external) - Will use this field to determine database source

## Migration Strategy

- **Phase 1**: Add optional `databaseVersion` field to types
- **Phase 2**: Update presale creation to set `databaseVersion: 'firestore'` for new presales
- **Phase 3**: Payment server updated to check `databaseVersion` field and default to RTDB if not present (backward compatibility)
- **Phase 4**: After full migration, make field required and remove RTDB fallback

