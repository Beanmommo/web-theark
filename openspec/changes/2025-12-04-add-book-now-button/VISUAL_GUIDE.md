# Visual Guide: Book Now Button Implementation

## Desktop Navigation (MainAppBar)

### Before Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Logo    Pickleball   Packages   Contact Us        👤  ☰     │
└─────────────────────────────────────────────────────────────────┘
```

### After Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Logo    Pickleball   Packages   Contact Us   📅 Book Now 👤  ☰│
└─────────────────────────────────────────────────────────────────┘
```

**When sportSlug = "futsal":**

- Logo shows futsal theme
- "Book Now" button appears
- Clicking navigates to `/futsal/booking`

**When sportSlug = "pickleball":**

- Logo shows pickleball theme
- "Book Now" button appears
- Clicking navigates to `/pickleball/booking`

**When no sportSlug (home page):**

- "Book Now" button is hidden
- Navigation appears as before

---

## Mobile Navigation Menu (MainAppBarMobileMenu)

### Before Implementation

```
┌────────────────────────────────┐
│ [Logo]              [X]        │
├────────────────────────────────┤
│ Pickleball                     │
│ Packages                       │
│ Contact Us                     │
├────────────────────────────────┤
│ Your Profile                   │
│ Sign Out                       │
└────────────────────────────────┘
```

### After Implementation

```
┌────────────────────────────────┐
│ [Logo]              [X]        │
├────────────────────────────────┤
│ Pickleball                     │
│ Packages                       │
│ Contact Us                     │
│ ┌──────────────────────────┐  │
│ │    📅 Book Now          │  │
│ └──────────────────────────┘  │
├────────────────────────────────┤
│ Your Profile                   │
│ Sign Out                       │
└────────────────────────────────┘
```

**When sportSlug = "futsal":**

- "Book Now" button appears after nav items
- Clicking navigates to `/futsal/booking`
- Menu automatically closes

**When sportSlug = "pickleball":**

- "Book Now" button appears after nav items
- Clicking navigates to `/pickleball/booking`
- Menu automatically closes

**When no sportSlug:**

- "Book Now" button is hidden
- Menu displays as before

---

## Button Styling Details

### Desktop Button

```
┌────────────────┐
│  📅 Book Now   │ ← Accent color background
└────────────────┘
  ↓ on hover
┌────────────────┐
│  📅 Book Now   │ ← Slightly raised with shadow
└────────────────┘
```

- **Default State:**

  - Background: Accent color (dynamic theme color)
  - Text: White
  - Padding: 8px 16px
  - Border-radius: 4px

- **Hover State:**

  - Opacity: 90%
  - Transform: translateY(-2px) (raised effect)
  - Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)

- **Active State:**
  - Transform: translateY(0) (back to normal)

### Mobile Button

```
┌──────────────────────────────┐
│    📅 Book Now               │ ← Full width
└──────────────────────────────┘
  ↓ on hover
┌──────────────────────────────┐
│    📅 Book Now               │ ← Slightly transparent
└──────────────────────────────┘
```

- **Default State:**

  - Background: Accent color
  - Text: White
  - Padding: 10px 16px
  - Width: 100% (full width of menu)
  - Border-radius: 4px
  - Margin-top: $unit spacing

- **Hover State:**

  - Opacity: 90%
  - Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)

- **Active State:**
  - Opacity: 80%

---

## Route Navigation Examples

### Futsal Sport Context

| Current Page        | Button Visible? | Destination       |
| ------------------- | --------------- | ----------------- |
| `/futsal`           | ✅ Yes          | `/futsal/booking` |
| `/futsal/venue`     | ✅ Yes          | `/futsal/booking` |
| `/futsal/venue/123` | ✅ Yes          | `/futsal/booking` |
| `/futsal/packages`  | ✅ Yes          | `/futsal/booking` |
| `/futsal/contactus` | ✅ Yes          | `/futsal/booking` |

### Pickleball Sport Context

| Current Page            | Button Visible? | Destination           |
| ----------------------- | --------------- | --------------------- |
| `/pickleball`           | ✅ Yes          | `/pickleball/booking` |
| `/pickleball/venue`     | ✅ Yes          | `/pickleball/booking` |
| `/pickleball/venue/456` | ✅ Yes          | `/pickleball/booking` |
| `/pickleball/packages`  | ✅ Yes          | `/pickleball/booking` |
| `/pickleball/contactus` | ✅ Yes          | `/pickleball/booking` |

### Non-Sport Pages (No Button)

| Current Page | Button Visible?      |
| ------------ | -------------------- |
| `/`          | ❌ No                |
| `/profile`   | ❌ No                |
| `/terms`     | ❌ No                |
| `/contact`   | ❌ No (no sportSlug) |

---

## Component Interaction Flow

### Desktop Flow

```
User Views /futsal/venue Page
         ↓
    MainAppBar Renders
         ↓
  sportSlug = "futsal" found
         ↓
  showBookNowButton = true
         ↓
  "Book Now" Button Displays ✅
         ↓
    User Clicks Button
         ↓
   handleBookNow() Executes
         ↓
 router.push("/futsal/booking")
         ↓
  Navigation to Booking Page
```

### Mobile Flow

```
User Views /futsal/venue Page
         ↓
MainAppBarMobileMenu Renders
         ↓
  sportSlug = "futsal" found
         ↓
 showBookNowButton = true
         ↓
 User Opens Mobile Menu
         ↓
 "Book Now" Button Shows ✅
         ↓
    User Clicks Button
         ↓
 async handleBookNow() Executes
         ↓
navigateTo("/futsal/booking")
         ↓
 showSidebar.value = false
         ↓
 Menu Closes & Navigate
```

---

## Responsive Behavior

### Large Screens (> 600px)

- Desktop button displays with normal padding (8px 16px)
- Font size: 0.95rem
- Positioned in grid layout with UserButton

### Small Screens (≤ 600px)

- Desktop button padding reduced (6px 12px)
- Font size reduced (0.85rem)
- Mobile menu button: Full width, larger touch target

### Mobile Menu (All Sizes)

- Button is always full width (100%)
- Larger padding (10px 16px) for better touch target
- Positioned after nav items for visibility

---

## Accessibility Features

✅ **Semantic HTML**

- Uses standard `<button>` element
- Screen readers can identify it as a button

✅ **Visual Feedback**

- Hover states provide visual indication
- Color contrast meets WCAG standards (white on accent color)

✅ **Keyboard Navigation**

- Button is focusable with Tab key
- Can be activated with Enter/Space

✅ **Mobile Touch Target**

- Adequate padding for touch screens
- Full width on mobile for easy interaction

---

## Color & Theming

The "Book Now" button uses `var(--v-accent)` CSS variable, which:

- Adapts to the current theme (Futsal or Pickleball)
- Maintains consistency across the application
- Automatically updates if theme changes

### Futsal Theme

- Accent Color: Green/Blue (based on futsal theme)

### Pickleball Theme

- Accent Color: Yellow/Orange (based on pickleball theme)

### Default Theme

- Accent Color: Default accent color

---

## Summary

The "Book Now" button provides:

- ✅ Prominent call-to-action on all sport pages
- ✅ Direct navigation to booking for context-aware experience
- ✅ Consistent appearance across desktop and mobile
- ✅ Responsive design for all screen sizes
- ✅ Contextual visibility (only shows when needed)
- ✅ Smooth user experience (menu closes after action)
