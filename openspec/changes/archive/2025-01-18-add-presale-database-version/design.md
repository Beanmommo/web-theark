# Design: Database Version Field for Presales

## Context

The Ark is migrating from Firebase Realtime Database (RTDB) to Firestore for storing presale and invoice data. During the transition period, both databases are operational, and the payment server needs to know which database to query when processing payments.

The payment server is an external service that receives presale information and processes payments. It needs to retrieve presale data from the correct database and update payment status accordingly.

## Goals / Non-Goals

### Goals

- Enable payment server to identify which database contains presale data
- Support gradual migration from RTDB to Firestore
- Maintain backward compatibility with existing presales
- Minimal code changes to existing payment flow

### Non-Goals

- Migrating existing RTDB data to Firestore (separate effort)
- Changing payment server implementation (only adding field support)
- Modifying payment processing logic beyond database selection

## Decisions

### Decision 1: Use String Literal Union Type

**Choice**: Define `databaseVersion` as `'rtdb' | 'firestore'` instead of enum or boolean.

**Rationale**:
- Clear, self-documenting values
- Easy to extend if additional database types are needed
- TypeScript provides compile-time type safety
- JSON-serializable without transformation

**Alternatives considered**:
- Boolean `isFirestore` - Less clear, harder to extend
- Enum `DatabaseType` - Overkill for two values, requires import

### Decision 2: Make Field Optional Initially

**Choice**: Add `databaseVersion?: DatabaseVersion` as optional field.

**Rationale**:
- Backward compatibility with existing presales in RTDB
- Payment server can default to RTDB when field is missing
- Gradual rollout without breaking existing functionality
- Can be made required after full migration

**Alternatives considered**:
- Required field with migration script - Too risky, requires updating all existing records
- Separate type for new presales - Code duplication, maintenance burden

### Decision 3: Include in Stripe Metadata

**Choice**: Pass `databaseVersion` in Stripe payment intent metadata.

**Rationale**:
- Payment server receives it via webhook
- Persisted with payment intent
- No additional API calls needed
- Stripe metadata supports string values

**Alternatives considered**:
- Separate API endpoint - Additional network call, complexity
- Query Firestore first, fallback to RTDB - Performance overhead, race conditions

### Decision 4: Set Value at Presale Creation

**Choice**: Set `databaseVersion: 'firestore'` when creating presales in `stores/presales.ts`.

**Rationale**:
- Single source of truth for database version
- All new presales use Firestore
- Clear migration path
- Easy to audit which presales are in which database

**Alternatives considered**:
- Environment variable - Less flexible, can't mix databases
- Configuration file - Requires deployment for changes

## Data Flow

```
User submits payment
  ↓
stores/presales.ts creates presale with databaseVersion: 'firestore'
  ↓
server/api/presales/index.ts saves to Firestore
  ↓
server/api/stripe/secret.post.ts creates payment intent with metadata
  ↓
Stripe processes payment
  ↓
Payment server webhook receives metadata.databaseVersion
  ↓
Payment server queries correct database (Firestore or RTDB)
  ↓
Payment server updates payment status in correct database
```

## Type Definitions

```typescript
// New type
export type DatabaseVersion = 'rtdb' | 'firestore';

// Updated Presale type
export type Presale = TotalCostData &
  CustomerDetails &
  PaymentData & {
    id: string;
    submittedDate: string;
    invoiceType: InvoiceType;
    typeOfSports?: string;
    databaseVersion?: DatabaseVersion; // NEW FIELD
  };
```

## Risks / Trade-offs

### Risk: Payment Server Not Updated

**Mitigation**: 
- Make field optional
- Payment server defaults to RTDB when field is missing
- Coordinate deployment with payment server team

### Risk: Mixed Database State

**Mitigation**:
- Clear documentation of which presales are in which database
- `databaseVersion` field provides audit trail
- Can query Firestore for all presales with `databaseVersion: 'firestore'`

### Trade-off: Optional Field Complexity

**Impact**: Code must handle both presence and absence of field

**Mitigation**:
- Clear documentation
- TypeScript optional chaining
- Payment server has clear fallback logic

## Migration Plan

### Phase 1: Add Field (This Change)

1. Add `databaseVersion` type and field to TypeScript types
2. Update presale creation to include `databaseVersion: 'firestore'`
3. Update Stripe metadata to include field
4. Deploy to production

### Phase 2: Payment Server Update (External Team)

1. Update payment server to read `databaseVersion` from metadata
2. Implement database selection logic
3. Default to RTDB when field is missing
4. Deploy payment server

### Phase 3: Verification

1. Monitor new presales have `databaseVersion: 'firestore'`
2. Verify payment server correctly routes to Firestore
3. Verify old presales still work (RTDB fallback)

### Phase 4: Full Migration (Future)

1. Migrate all RTDB presales to Firestore
2. Make `databaseVersion` required field
3. Remove RTDB fallback logic
4. Deprecate RTDB for presales

## Open Questions

- **Q**: Should we backfill existing Firestore presales with `databaseVersion: 'firestore'`?
  - **A**: Not necessary initially. Field absence indicates RTDB. Can backfill later if needed.

- **Q**: What happens if payment server receives unknown `databaseVersion` value?
  - **A**: Payment server should log error and default to RTDB for safety.

- **Q**: Should invoices also have `databaseVersion` field?
  - **A**: Yes, for consistency. Invoices are created from presales and should track database version.

