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
- [x] 3.2 Update `server/api/stripe/secret.post.ts` to include `databaseVersion` in payment intent metadata
- [x] 3.3 Add validation for `databaseVersion` field in request body validation

## 4. Testing

- [ ] 4.1 Test booking presale creation includes `databaseVersion: 'firestore'`
- [ ] 4.2 Test package presale creation includes `databaseVersion: 'firestore'`
- [ ] 4.3 Test Stripe payment intent metadata includes `databaseVersion`
- [ ] 4.4 Verify Firestore document contains `databaseVersion` field
- [ ] 4.5 Test backward compatibility - existing presales without field still work

## 5. Documentation

- [ ] 5.1 Update payment server documentation to include `databaseVersion` field usage
- [ ] 5.2 Document migration strategy for transitioning from RTDB to Firestore
