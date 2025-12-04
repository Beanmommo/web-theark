# Add Book Now Button to Navigation Headers

## Summary

This proposal adds a prominent "Book Now" button to both the desktop and mobile navigation components (`MainAppBar.vue` and `MainAppBarMobileMenu.vue`) that appears only when users are viewing sport-specific pages (e.g., `/futsal`, `/pickleball`, or their sub-pages).

The button provides a direct call-to-action that navigates users to the booking page (`/{sportSlug}/booking`) for the current sport, improving user experience and reducing friction in the booking flow.

## Key Features

- **Desktop Navigation**: "Book Now" button added to the right side of `MainAppBar.vue`
- **Mobile Navigation**: "Book Now" button added to the mobile menu in `MainAppBarMobileMenu.vue`
- **Conditional Display**: Button only appears when a `sportSlug` is present in the route
- **Direct Navigation**: Button navigates directly to `/{sportSlug}/booking`
- **Visual Distinction**: Button styled with accent color for prominence
- **Auto-Close Mobile Menu**: Mobile menu closes automatically after clicking "Book Now"

## Components Affected

1. **`components/MainAppBar.vue`**

   - Add conditional "Book Now" button to the right side of the navigation bar
   - Button only shows when `sportSlug` is defined

2. **`components/MainAppBarMobileMenu.vue`**
   - Add conditional "Book Now" button to the mobile menu
   - Button only shows when `sportSlug` is defined
   - Menu closes when button is clicked

## Specification

The detailed specification for this feature is documented in [`specs/navigation-header/spec.md`](specs/navigation-header/spec.md), which includes:

- Desktop navigation button scenarios
- Mobile navigation button scenarios
- Navigation behavior for different sports (Futsal, Pickleball)
- Conditional rendering logic
- Button styling and positioning requirements

## Implementation Tasks

See [`tasks.md`](tasks.md) for the complete list of implementation tasks, including:

- Component updates for both MainAppBar and MainAppBarMobileMenu
- Comprehensive testing scenarios across different screen sizes and routes
- Documentation and code comments

## Route Context

The button appears when `sportSlug` exists in the route, including:

- `/futsal` - Futsal home page
- `/futsal/booking` - Futsal booking page (button still shows)
- `/futsal/venue` - Futsal venue listing page
- `/futsal/venue/[key]` - Individual venue detail page
- `/futsal/packages` - Futsal packages page
- `/futsal/contactus` - Futsal contact us page
- `/pickleball` - Pickleball home page
- `/pickleball/booking` - Pickleball booking page
- `/pickleball/venue` - Pickleball venue listing page
- And all other pickleball-related routes

The button does NOT appear on:

- `/` - Home page (no sportSlug)
- `/profile` - User profile page (no sportSlug)
- `/terms` - Terms page (no sportSlug)
- Other pages without a sportSlug parameter
