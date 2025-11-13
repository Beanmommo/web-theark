# Implementation Tasks

## 1. Type Definitions

- [x] 1.1 Add `SportsGallery` interface to `types/data.ts`
- [x] 1.2 Add `SportsGalleries` type to `types/data.ts`
- [x] 1.3 Update `Venue` interface to include optional `sportsGalleries` field

## 2. Component Updates - SportVenueCardItem

- [ ] 2.1 Add computed property in `SportVenueCardItem.vue` to determine sport-specific image source
- [ ] 2.2 Update `CldImage` src binding to use the new computed property
- [ ] 2.3 Add helper function to capitalize sport name for gallery lookup

## 3. Component Updates - VenuePage

- [ ] 3.1 Add computed property in `VenuePage.vue` to determine sport-specific gallery images
- [ ] 3.2 Update `carouselImages` computed to use sport-specific gallery when available
- [ ] 3.3 Maintain fallback logic to legacy `publicId` and `gallery` fields
- [ ] 3.4 Ensure proper Cloudinary URL construction for sport-specific images

## 4. Testing

- [ ] 4.1 Test SportVenueCardItem with venue that has `sportsGalleries` data (Orchid Country Club)
- [ ] 4.2 Test SportVenueCardItem with venue that only has legacy `publicId` (backward compatibility)
- [ ] 4.3 Test VenuePage carousel with venue that has `sportsGalleries` data
- [ ] 4.4 Test VenuePage carousel with venue that only has legacy `gallery` array
- [ ] 4.5 Verify Futsal venues show Futsal-specific images in both card and carousel
- [ ] 4.6 Verify Pickleball venues show Pickleball-specific images in both card and carousel
- [ ] 4.7 Test on both `/futsal/venue` and `/pickleball/venue` listing pages
- [ ] 4.8 Test on individual venue pages `/futsal/venue/[key]` and `/pickleball/venue/[key]`
- [ ] 4.9 Verify carousel shows multiple images from sport-specific gallery array

## 5. Documentation

- [ ] 5.1 Add code comments in SportVenueCardItem explaining the fallback logic
- [ ] 5.2 Add code comments in VenuePage explaining the carousel image selection
- [ ] 5.3 Document the expected data structure in comments
