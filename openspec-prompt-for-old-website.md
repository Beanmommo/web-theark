# OpenSpec Proposal Prompt for Old Website

## Context

This prompt is for implementing the `databaseVersion` field in the **old/legacy website** to support the database migration from Firebase Realtime Database (RTDB) to Firestore.

## Background

The Ark sports booking system has two websites:
1. **New website** (current repository) - Already implemented `databaseVersion` field
2. **Old website** (legacy system) - Needs to implement the same field

Both websites create presale records that are processed by a shared external payment server. The payment server needs to know which database contains each presale's data to route operations correctly during the RTDB-to-Firestore migration period.

## Proposal Request

**Create an OpenSpec proposal to add a `databaseVersion` field to the presale type in the old website.**

### Requirements

#### 1. Add Database Version Field

- Add a new field called `databaseVersion` to the presale/booking data structure
- The field should accept two possible values: `'rtdb'` or `'firestore'`
- The field should be **optional** to maintain backward compatibility
- Since the old website still writes to RTDB, set the value to `'rtdb'` for all new presales

#### 2. Update Presale Creation Logic

- Identify where presales/bookings are created in the old website codebase
- Update the presale creation logic to include `databaseVersion: 'rtdb'`
- Ensure the field is included for both:
  - Regular venue bookings
  - Credit package purchases
  - Any other presale types

#### 3. Ensure Data Persistence

- Verify that the `databaseVersion` field is persisted to the database (RTDB)
- The field should be included in the presale document/record
- No special validation is needed - just ensure it's saved along with other presale data

#### 4. PayNow Payment Integration

- The `databaseVersion` field is **only relevant for PayNow payments**
- PayNow payments are processed by an external payment server
- The payment server will read the presale data from RTDB and use the `databaseVersion` field to determine which database to query
- **Do NOT** include `databaseVersion` in Stripe payment flows (if applicable)

#### 5. Maintain Backward Compatibility

- Existing presales without the `databaseVersion` field should continue to work
- The payment server will default to RTDB when the field is missing
- No migration of existing data is required

### Implementation Guidance

#### Type Definition (if using TypeScript)

```typescript
// Add this type
export type DatabaseVersion = 'rtdb' | 'firestore';

// Update presale/booking type to include:
databaseVersion?: DatabaseVersion;
```

#### Presale Creation Example

```javascript
// When creating a new presale, include:
const presaleData = {
  id: newPresaleId,
  // ... other presale fields
  databaseVersion: 'rtdb', // Add this field
};

// Save to RTDB
database.ref('presales/' + presaleId).set(presaleData);
```

### Key Differences from New Website

| Aspect | New Website | Old Website |
|--------|-------------|-------------|
| Database | Firestore | RTDB |
| `databaseVersion` value | `'firestore'` | `'rtdb'` |
| Implementation status | ✅ Complete | ⏳ To be implemented |

### Migration Strategy

1. **Phase 1**: Add `databaseVersion` field to old website (set to `'rtdb'`)
2. **Phase 2**: Payment server updated to read and use `databaseVersion` field
3. **Phase 3**: New website continues using `'firestore'` value
4. **Phase 4**: Gradually migrate old website to Firestore (future)
5. **Phase 5**: Eventually deprecate old website and RTDB

### Testing Checklist

- [ ] New presales from old website include `databaseVersion: 'rtdb'`
- [ ] Field is persisted to RTDB correctly
- [ ] PayNow payments work correctly with the new field
- [ ] Existing presales without the field still work (backward compatibility)
- [ ] Payment server can read the field and route to correct database

### Expected Deliverables

1. **OpenSpec Proposal** - Following the same structure as the new website
2. **Implementation** - Code changes to add the field
3. **Testing** - Verify the field is included and persisted
4. **Documentation** - Update any relevant documentation

### Notes

- This is a **minimal change** - just adding one field to presale data
- No changes to payment processing logic required
- No changes to UI/UX required
- The field is purely for backend database routing
- Focus on PayNow payments only (not Stripe)

### Questions to Answer

1. Where in the old website codebase are presales created?
2. What is the data structure/type definition for presales?
3. How are presales saved to RTDB?
4. Are there multiple places where presales are created?
5. Does the old website use TypeScript or JavaScript?

### Reference

- New website implementation: `openspec/changes/add-presale-database-version/`
- New website PR: https://github.com/Beanmommo/web-theark/pull/4
- This ensures consistency between old and new websites during the migration period

