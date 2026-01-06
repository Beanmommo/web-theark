# Implementation Examples - Sports Type Filtering for Credit Packages

## Data Structure

### PackageDetails Type (Already Exists)

```typescript
export type PackageDetails = {
  title: string;
  name?: string;
  amount: string;
  expiryPeriod: number;
  type: string;
  unit: string;
  value: string;
  id: string;
  typeOfSports: string; // ← This field is used for filtering
  image?: string;
};
```

### CreditPackage Type (Already Exists)

```typescript
export type CreditPackage = {
  amount: string;
  creditsLeft: number;
  expiryDate: string;
  key?: string;
  userKey: string;
  value: string;
  paymentMethod: PaymentMethods;
  submittedDate: string;
  paymentStatus: string;
  name: string;
  email: string;
  contact: string;
  creditPackage: PackageDetails; // ← Contains typeOfSports
  // ... other fields
};
```

## Example 1: Package Purchase Flow

### Current Behavior (Already Implemented)

```typescript
// stores/packages.ts
const getPackagesBySport = (sportSlug: string) => {
  return packages.value.filter(
    (pkg) => (pkg.typeOfSports?.toLowerCase() ?? "futsal") === sportSlug
  );
};

// components/PackagePurchasePage1.vue
const route = useRoute();
const sportSlug = route.params.sportSlug as string; // "futsal" or "pickleball"

const packagesStore = usePackagesStore();
const packageConfig = computed(() => {
  return packagesStore.getPackagesBySport(sportSlug); // Already filters by sport!
});
```

**Result**: This is already working correctly! No changes needed for package purchase flow.

## Example 2: Booking Payment Flow - Credit Store

### Current Behavior (Needs Update)

```typescript
// stores/credits.ts - fetchUserCreditsAndRefunds()
// Currently shows ALL packages for the user, regardless of sport
const userPackages = [];
Object.keys(packages).forEach((key) => {
  // ... filtering logic
  userPackages.push({
    ...packages[key],
    key,
  });
});
```

### Proposed Change

```typescript
// stores/credits.ts - fetchUserCreditsAndRefunds(sportType?: string)
const userPackages = [];
Object.keys(packages).forEach((key) => {
  const pkg = packages[key];
  const pkgSportType =
    pkg.creditPackage?.typeOfSports?.toLowerCase() ?? "futsal";

  // Filter by sport type if provided
  if (sportType && pkgSportType !== sportType.toLowerCase()) {
    return; // Skip this package
  }

  // ... existing filtering logic
  userPackages.push({
    ...packages[key],
    key,
  });
});
```

## Example 3: Booking Payment Flow - Available Packages

### Current Behavior (Needs Update)

```typescript
// composables/useSharedBookingForm.ts
const getAvailablePackages = (userKey: string): CreditPackage[] => {
  const packages = Object.values(
    creditPackagesStore.creditPackagesList
  ) as CreditPackage[];
  return packages
    .filter((p) => p.userKey === userKey && p.creditsLeft > 0)
    .sort(...);
};
```

### Proposed Change

```typescript
// composables/useSharedBookingForm.ts
const getAvailablePackages = (userKey: string, sportType?: string): CreditPackage[] => {
  const packages = Object.values(
    creditPackagesStore.creditPackagesList
  ) as CreditPackage[];
  return packages
    .filter((p) => {
      // Existing filters
      if (p.userKey !== userKey || p.creditsLeft <= 0) return false;

      // Sport type filter
      if (sportType) {
        const pkgSportType = p.creditPackage?.typeOfSports?.toLowerCase() ?? "futsal";
        if (pkgSportType !== sportType.toLowerCase()) return false;
      }

      return true;
    })
    .sort(...);
};
```

## Example 4: Admin Unpaid Booking Drawer

### Current Behavior (Needs Update)

```typescript
// admin-theark-new/components/UnpaidBookingDrawer.vue
async function fetchCustomerCredits() {
  // ... fetch credit data

  const availablePackages = allPackages.filter(
    (pkg) =>
      pkg.email?.toLowerCase() === emailLower &&
      pkg.creditsLeft > 0 &&
      (!pkg.expiryDate || dayjs(pkg.expiryDate).isAfter(now))
  );
  // Shows ALL packages for the customer
}
```

### Proposed Change

```typescript
// admin-theark-new/components/UnpaidBookingDrawer.vue
async function fetchCustomerCredits() {
  // ... fetch credit data

  // Extract sport type from slot details
  const bookingSportType = slotDetails.value[0]?.typeOfSports?.toLowerCase();

  const availablePackages = allPackages.filter((pkg) => {
    if (pkg.email?.toLowerCase() !== emailLower) return false;
    if (pkg.creditsLeft <= 0) return false;
    if (pkg.expiryDate && !dayjs(pkg.expiryDate).isAfter(now)) return false;

    // Filter by sport type
    if (bookingSportType) {
      const pkgSportType =
        pkg.creditPackage?.typeOfSports?.toLowerCase() ?? "futsal";
      if (pkgSportType !== bookingSportType) return false;
    }

    return true;
  });
}
```

## Example 5: Credit Ledger Validation

### Proposed Addition

```typescript
// composables/useCreditLedger.ts - recordUsage()
const recordUsage = async (
  userKey: string,
  email: string,
  name: string,
  contact: string,
  amount: number,
  bookingKey: string,
  sportType: string // ← New parameter
): Promise<void> => {
  // ... existing code

  // Validate sport type before processing
  const creditPackage = await $fetch(`/api/credits/id/${packageKey}`);
  const pkgSportType =
    creditPackage?.creditPackage?.typeOfSports?.toLowerCase() ?? "futsal";

  if (pkgSportType !== sportType.toLowerCase()) {
    throw new Error(
      `Credit package sport type (${pkgSportType}) does not match booking sport type (${sportType})`
    );
  }

  // ... continue with credit usage
};
```

## Testing Scenarios

### Scenario 1: User with Mixed Credits Books Futsal

- User has: $100 Futsal credits, $50 Pickleball credits
- User books: Futsal court for $30
- Expected: Only shows $100 Futsal credits available
- Payment: Uses Futsal credits, balance becomes $70 Futsal, $50 Pickleball

### Scenario 2: User with Mixed Credits Books Pickleball

- User has: $100 Futsal credits, $50 Pickleball credits
- User books: Pickleball court for $30
- Expected: Only shows $50 Pickleball credits available
- Payment: Uses Pickleball credits, balance becomes $100 Futsal, $20 Pickleball

### Scenario 3: Legacy Purchased Credit Package (No typeOfSports)

- **Database State**: Existing `CreditPackage` record purchased before sports type filtering
  ```json
  {
    "amount": "100",
    "creditsLeft": 100,
    "userKey": "user123",
    "creditPackage": {
      "amount": "100",
      "value": "120",
      "title": "Standard Package"
      // NOTE: No typeOfSports field!
    }
  }
  ```
- **Expected Behavior**: Treated as Futsal package (default)
- **Futsal Booking**: Shows in available credits, can be used
- **Pickleball Booking**: Does NOT show in available credits, cannot be used
- **Package Purchase Page**: Not applicable (this is a purchased package, not a package definition)

### Scenario 4: Mixed Legacy and New Purchased Packages

- **User has**:
  - Old package: $100 credits (no typeOfSports → defaults to Futsal)
  - New Futsal package: $50 credits (typeOfSports: "Futsal")
  - New Pickleball package: $30 credits (typeOfSports: "Pickleball")
- **Futsal Booking**:
  - Available credits: $150 (old $100 + new Futsal $50)
  - Hidden: Pickleball $30
- **Pickleball Booking**:
  - Available credits: $30 (only new Pickleball)
  - Hidden: old $100 + Futsal $50
