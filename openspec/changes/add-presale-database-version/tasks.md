# Implementation Tasks

## 1. Type Definitions

- [x] 1.1 Add `DatabaseVersion` type as union type `'rtdb' | 'firestore'` in `types/data.ts`
- [x] 1.2 Add optional `databaseVersion?: DatabaseVersion` field to `Presale` type in `types/data.ts`
- [x] 1.3 Add optional `databaseVersion?: DatabaseVersion` field to `Invoice` type in `types/data.ts` (for consistency)

## 2. Presale Store Updates

- [x] 2.1 Update `addPresale()` function in `stores/presales.ts` to include `databaseVersion: 'firestore'`
- [x] 2.2 Update `addPackagePresale()` function in `stores/presales.ts` to include `databaseVersion: 'firestore'`
- [x] 2.3 Verify presale data includes `databaseVersion` in computed properties

## 3. API Updates

- [x] 3.1 Verify `server/api/presales/index.ts` persists `databaseVersion` field to Firestore

## 4. Testing

- [x] 4.1 Test booking presale creation includes `databaseVersion: 'firestore'`
- [x] 4.2 Test package presale creation includes `databaseVersion: 'firestore'`
- [x] 4.3 Verify Firestore document contains `databaseVersion` field
- [x] 4.4 Test backward compatibility - existing presales without field still work

## 5. Documentation

- [x] 5.1 Update payment server documentation to include `databaseVersion` field usage (for PayNow payments only)
- [x] 5.2 Document migration strategy for transitioning from RTDB to Firestore

## Notes

- The `databaseVersion` field is only relevant for PayNow payments processed by the external payment server
- Stripe credit card payments are handled entirely within this application and do not require this field
- The payment server will read the `databaseVersion` field from the presale document in Firestore when processing PayNow payments
