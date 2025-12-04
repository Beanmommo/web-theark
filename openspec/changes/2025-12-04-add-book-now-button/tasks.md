# Implementation Tasks

## 1. MainAppBar Component Updates

- [x] 1.1 Add "Book Now" button to the right side of the desktop navigation bar in `MainAppBar.vue`
- [x] 1.2 Implement conditional rendering so the button only appears when `sportSlug` is defined
- [x] 1.3 Add click handler to navigate to `/{sportSlug}/booking`
- [x] 1.4 Style the "Book Now" button with accent color to make it visually distinct
- [x] 1.5 Ensure proper spacing and alignment with existing elements (UserButton)

## 2. MainAppBarMobileMenu Component Updates

- [x] 2.1 Add "Book Now" button to the mobile navigation menu in `MainAppBarMobileMenu.vue`
- [x] 2.2 Implement conditional rendering so the button only appears when `sportSlug` is defined
- [x] 2.3 Position the button appropriately in the mobile menu (above or in the content area)
- [x] 2.4 Add click handler to navigate to `/{sportSlug}/booking` and close the menu
- [x] 2.5 Style the button to match the mobile menu design and be visually distinct

## 3. Testing

- [ ] 3.1 Test MainAppBar shows "Book Now" button on `/futsal` route
- [ ] 3.2 Test MainAppBar shows "Book Now" button on `/pickleball` route
- [ ] 3.3 Test MainAppBar does NOT show "Book Now" button on `/` (home page)
- [ ] 3.4 Test MainAppBar "Book Now" button navigates to `/futsal/booking` when on futsal pages
- [ ] 3.5 Test MainAppBar "Book Now" button navigates to `/pickleball/booking` when on pickleball pages
- [ ] 3.6 Test MainAppBarMobileMenu shows "Book Now" button on `/futsal` route
- [ ] 3.7 Test MainAppBarMobileMenu shows "Book Now" button on `/pickleball` route
- [ ] 3.8 Test MainAppBarMobileMenu does NOT show "Book Now" button on `/` (home page)
- [ ] 3.9 Test MainAppBarMobileMenu "Book Now" button navigates correctly and closes menu
- [ ] 3.10 Test button styling and visibility on various screen sizes
- [ ] 3.11 Test button on `/futsal/booking`, `/futsal/packages`, `/futsal/contactus` pages
- [ ] 3.12 Test button on `/pickleball/booking`, `/pickleball/packages`, `/pickleball/contactus` pages

## 4. Documentation

- [x] 4.1 Add code comments explaining the conditional rendering logic in MainAppBar
- [x] 4.2 Add code comments explaining the conditional rendering logic in MainAppBarMobileMenu
- [x] 4.3 Document the expected behavior in both components
