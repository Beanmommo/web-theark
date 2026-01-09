# Web App Implementation: Load Sports from Firebase

## ✅ What's Been Completed

### 1. Updated Type Definitions
**File:** `types/data.ts`

Extended `SportType` to match admin configuration:

```typescript
export type SportType = {
  active: boolean;
  name: string;
  slug: string;
  
  // Launch scheduling
  adminPublishDate?: string;
  websitePublishDate?: string;
  bookingPublishDate?: string;
  
  // UI configuration
  icon: string;
  theme: string;
  backgroundImage: string;
  tag: string;
  startingRate: number;
  
  // Terminology
  terminology: {
    singular: string;
    plural: string;
  };
};
```

---

### 2. Updated Sports Store
**File:** `stores/sports.ts`

**Changes:**
- ✅ Removed hardcoded sports array
- ✅ Added `fetchSports()` method to load from Firebase
- ✅ Added `isLoaded` flag to track loading state
- ✅ Implemented `websitePublishDate` filtering
- ✅ Converts `SportType[]` from config to `Sport[]` for UI

**Key Logic:**
```typescript
const fetchSports = async () => {
  const configStore = useConfigStore();
  await configStore.fetchConfig();
  
  const sportsTypes = configStore.getSportTypes();
  const now = new Date();
  
  // Filter by active status and publish date
  sports.value = sportsTypes
    .filter((sportType) => {
      if (!sportType.active) return false;
      
      if (sportType.websitePublishDate) {
        const publishDate = new Date(sportType.websitePublishDate);
        if (publishDate > now) return false;
      }
      
      return true;
    })
    .map((sportType) => ({
      name: sportType.name,
      slug: sportType.slug,
      icon: sportType.icon,
      theme: sportType.theme,
      backgroundImage: sportType.backgroundImage,
      tag: sportType.tag,
      startingRate: sportType.startingRate,
    }));
};
```

---

### 3. Updated Pages
**Files:** `pages/index.vue`, `pages/[sportSlug]/index.vue`

**Changes:**
- ✅ Added `sportsStore.fetchSports()` to data fetching
- ✅ Sports now loaded on page mount
- ✅ Integrated with existing async data loading

**Homepage:**
```typescript
await Promise.all([
  useAsyncData('locations', () => locationsStore.fetchLocations()),
  useAsyncData('pitches', () => pitchesStore.fetchPitches()),
  useAsyncData('timeslots', () => timeslotsStore.fetchTimeslots()),
  useAsyncData('sports', () => sportsStore.fetchSports()), // NEW
])
```

---

## 🎯 How It Works

### Data Flow

```
Firebase Config (/config/sportsTypes)
    ↓
configStore.fetchConfig()
    ↓
sportsStore.fetchSports()
    ↓
Filter by active & websitePublishDate
    ↓
Convert SportType[] → Sport[]
    ↓
UI Components (SportCardItem, etc.)
```

---

## 📅 Publish Date Logic

### For Existing Sports (Futsal, Pickleball)
- `websitePublishDate` is **empty** or **undefined**
- ✅ Always visible (already live)

### For New Sports (e.g., Badminton)
- `websitePublishDate` = `"2026-02-01T00:00:00"`
- ❌ Hidden until Feb 1, 2026
- ✅ Visible after Feb 1, 2026

### Active Status
- `active: false` → Never shown
- `active: true` → Shown if publish date passed

---

## 🔄 Migration Path

### Before (Hardcoded)
```typescript
const sports = ref<Sport[]>([
  {
    name: "Futsal",
    slug: "futsal",
    icon: "mdi-soccer",
    // ... hardcoded values
  }
]);
```

### After (Firebase)
```typescript
const sports = ref<Sport[]>([]);

const fetchSports = async () => {
  // Load from Firebase config
  const sportsTypes = configStore.getSportTypes();
  sports.value = sportsTypes.filter(...).map(...);
};
```

---

## ✅ Backward Compatibility

- ✅ `Sport` type unchanged (UI components work as-is)
- ✅ All existing methods preserved (`getSportBySlug`, etc.)
- ✅ No breaking changes to components
- ✅ Terminology system still works via configStore

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Homepage loads and displays sports
- [ ] Sport cards show correct icon, name, tag, startingRate
- [ ] Clicking "Book Now" navigates to sport page
- [ ] Sport-specific pages load correctly
- [ ] Terminology displays correctly (pitch/court)

### Date-Based Testing
- [ ] Sports with no `websitePublishDate` are visible
- [ ] Sports with future `websitePublishDate` are hidden
- [ ] Sports with past `websitePublishDate` are visible
- [ ] Inactive sports (`active: false`) are hidden

---

## 📊 Next Steps

### Immediate
1. ✅ Run migration script in admin app
2. ✅ Verify data in Firebase Console
3. ⏳ Test web app with Firebase data
4. ⏳ Deploy to staging

### Future Enhancements
1. **Booking Date Logic** - Implement `bookingPublishDate` filtering
2. **Coming Soon UI** - Show sports before booking is available
3. **Admin Date Logic** - Use `adminPublishDate` in admin panel
4. **Loading States** - Add skeleton loaders while fetching
5. **Error Handling** - Graceful fallback if config fails

---

## 🎉 Summary

**What Changed:**
- Sports data source: Hardcoded → Firebase Config
- Sports visibility: Always shown → Date-based filtering
- Configuration: Code changes → Admin panel updates

**Benefits:**
- ✅ No code deploys to add new sports
- ✅ Controlled launch scheduling
- ✅ Centralized configuration
- ✅ Easy A/B testing and rollbacks

**Status:** ✅ Web Side Complete | Ready for Testing

