# Troubleshooting Guide: Sports from Firebase

## Common Issues and Solutions

### 1. Error: "Cannot read properties of undefined (reading 'colors')"

**Symptom:**
```
Error: Cannot read properties of undefined (reading 'colors')
at SportCardItem.vue:31:46
```

**Cause:**
The theme name from Firebase config doesn't exist in Vuetify's theme configuration.

**Solution:**
✅ **Already Fixed** - Added safe theme access with fallback color in `SportCardItem.vue`

**How it works:**
```typescript
const accentColor = computed(() => {
  const sport = sportsStore.getSportByName(props.sport.name);
  if (!sport) return "#008000"; // Default green fallback
  
  const sportTheme = theme.themes.value[sport.theme];
  if (!sportTheme || !sportTheme.colors) {
    console.warn(`Theme "${sport.theme}" not found, using default`);
    return "#008000"; // Default green fallback
  }
  
  return sportTheme.colors.accent;
});
```

**To add a new theme:**
Edit `plugins/vuetify.ts`:
```typescript
const badmintonTheme = {
  dark: false,
  colors: {
    primary: "#000",
    secondary: "#b0bec5",
    accent: "#FF6B35", // Your sport color
    error: "#b71c1c",
  },
};

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      themes: {
        thearkTheme,
        futsalTheme,
        pickleBallTheme,
        badmintonTheme, // Add here
      },
    },
  });
});
```

---

### 2. Sports Not Showing on Homepage

**Symptom:**
Homepage loads but no sports cards appear.

**Possible Causes & Solutions:**

#### A. Sports not fetched
**Check:** Browser console for errors
**Solution:** Ensure `fetchSports()` is called in `pages/index.vue`

#### B. All sports have future publish dates
**Check:** Firebase Console → `/config/sportsTypes` → `websitePublishDate`
**Solution:** 
- For existing sports: Leave `websitePublishDate` empty
- For new sports: Set date to past or empty to show immediately

#### C. All sports are inactive
**Check:** Firebase Console → `/config/sportsTypes` → `active`
**Solution:** Set `active: true` for sports you want to show

#### D. Config not in Firebase
**Check:** Firebase Console → `/config/sportsTypes` exists
**Solution:** Run migration script:
```bash
cd admin-theark-new
npm run migrate:sports
```

---

### 3. Sport Page Shows 404

**Symptom:**
Clicking "Book Now" or navigating to `/futsal` shows 404.

**Cause:**
Sport slug in Firebase doesn't match route parameter.

**Solution:**
Ensure slug in Firebase matches exactly (lowercase):
- ✅ `futsal` (correct)
- ❌ `Futsal` (wrong - uppercase)
- ❌ `futsal ` (wrong - trailing space)

---

### 4. Wrong Terminology Displayed

**Symptom:**
Shows "Pitch" instead of "Court" for Pickleball.

**Cause:**
Terminology not set in Firebase config.

**Solution:**
Check Firebase Console → `/config/sportsTypes`:
```json
{
  "terminology": {
    "singular": "court",
    "plural": "courts"
  }
}
```

Run migration script if missing:
```bash
cd admin-theark-new
npm run migrate:sports
```

---

### 5. Sports Load Slowly

**Symptom:**
Homepage takes several seconds to show sports.

**Cause:**
Multiple sequential API calls instead of parallel.

**Solution:**
✅ **Already Optimized** - Using `Promise.all()`:
```typescript
await Promise.all([
  useAsyncData('locations', () => locationsStore.fetchLocations()),
  useAsyncData('pitches', () => pitchesStore.fetchPitches()),
  useAsyncData('timeslots', () => timeslotsStore.fetchTimeslots()),
  useAsyncData('sports', () => sportsStore.fetchSports()),
])
```

---

### 6. Theme Doesn't Change on Sport Pages

**Symptom:**
Navigating to `/futsal` doesn't change theme to green.

**Cause:**
Sports not loaded in `app.vue` before theme watcher runs.

**Solution:**
✅ **Already Fixed** - Sports fetched in `app.vue`:
```typescript
await Promise.all([
  useAsyncData("config", () => configStore.fetchConfig()),
  useAsyncData("sports", () => sportsStore.fetchSports()),
]);
```

---

## Debugging Checklist

When sports aren't working, check in order:

### 1. Firebase Data
- [ ] `/config/sportsTypes` exists in Firebase
- [ ] Sports have `active: true`
- [ ] `websitePublishDate` is empty or in the past
- [ ] All required fields present (name, slug, icon, theme, etc.)

### 2. Browser Console
- [ ] No JavaScript errors
- [ ] Check Network tab for failed API calls
- [ ] Look for warnings about missing themes

### 3. Store State
Open Vue DevTools:
- [ ] `sportsStore.sports` has items
- [ ] `sportsStore.isLoaded` is `true`
- [ ] `configStore.config.sportsTypes` has data

### 4. Component Props
In Vue DevTools, check `SportCardItem`:
- [ ] Receives `sport` prop
- [ ] `sport.slug` is correct
- [ ] `sport.theme` matches Vuetify theme name

---

## Quick Fixes

### Reset Everything
```bash
# 1. Clear browser cache and localStorage
# 2. Re-run migration
cd admin-theark-new
npm run migrate:sports

# 3. Restart dev server
cd ../web-theark-multisports
npm run dev
```

### Verify Firebase Data
```bash
# Use Firebase CLI
firebase database:get /config/sportsTypes
```

### Check API Response
```javascript
// In browser console
fetch('/api/config')
  .then(r => r.json())
  .then(d => console.log(d.sportsTypes))
```

---

## Still Having Issues?

1. Check the implementation guide: `IMPLEMENTATION.md`
2. Review the migration guide: `../../../admin-theark-new/openspec/.../MIGRATION.md`
3. Verify all commits are applied from the feature branch
4. Check Firebase Console for data structure
5. Look for console errors in both browser and terminal

---

**Last Updated:** 2026-01-08

