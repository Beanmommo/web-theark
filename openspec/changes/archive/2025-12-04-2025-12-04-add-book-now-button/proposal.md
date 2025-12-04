# Add Book Now Button to Navigation Headers

## Why

Currently, users navigating the web-theark-multisports website must click through multiple menu items to reach the booking page. When users are viewing a specific sport (e.g., `/futsal` or `/pickleball`), they should have a direct, prominent "Book Now" call-to-action button in both the desktop navigation bar and mobile menu to streamline the booking experience and improve conversion.

## What Changes

- Add a prominent "Book Now" button to `MainAppBar.vue` that appears only when viewing a specific sport page (when `sportSlug` is present)
- Add a "Book Now" button to `MainAppBarMobileMenu.vue` in the mobile navigation menu that appears only when viewing a specific sport page
- The "Book Now" button navigates directly to `/{sportSlug}/booking`
- The button should be visually distinct from other navigation items to draw user attention

## Impact

### Affected specs

- `navigation-header` (new capability spec)

### Affected code

- `components/MainAppBar.vue` - Add "Book Now" button to desktop navigation
- `components/MainAppBarMobileMenu.vue` - Add "Book Now" button to mobile menu

### Breaking changes

None - this is a non-breaking feature addition

### Benefits

- Improved user experience with direct access to booking functionality
- Increased booking conversion by reducing friction in the booking flow
- Consistent call-to-action across both desktop and mobile interfaces
- Contextual "Book Now" action that only appears when a user is in a sport-specific context
