# Update Sport Venue Card Image Selection

## Why

The current implementation of `SportVenueCardItem.vue` uses a single `publicId` field from the venue data to display the venue image. However, the Firebase location data now includes a `sportsGalleries` object that provides sport-specific images with dedicated `public_id` fields for each sport type (Futsal, Pickleball, etc.).

This creates a mismatch where:

- A venue may show a Futsal pitch image when displaying Pickleball courts
- The component doesn't leverage the sport-specific imagery already available in the database
- Users may see incorrect or misleading venue images based on their selected sport

## What Changes

- Update `SportVenueCardItem.vue` to use sport-specific images from `sportsGalleries` when available
- Update `VenuePage.vue` carousel to use sport-specific gallery images from `sportsGalleries`
- Add fallback logic to use the legacy `publicId` and `gallery` fields when `sportsGalleries` is not available
- Update the `Venue` TypeScript interface to include the optional `sportsGalleries` field
- Ensure backward compatibility with existing venue data that may not have `sportsGalleries`

The change will:

1. Check if `venue.sportsGalleries` exists
2. Look up the sport-specific gallery using the capitalized sport name (e.g., "Futsal", "Pickleball")
3. For `SportVenueCardItem`: Use the `public_id` from the sport-specific gallery
4. For `VenuePage` carousel: Use the `gallery` array from the sport-specific gallery
5. Fall back to the legacy `venue.publicId` and `venue.gallery` if sport-specific data is unavailable

## Impact

### Affected specs

- `venue-display` (new capability spec)

### Affected code

- `components/SportVenueCardItem.vue` - Main component requiring image source logic update
- `components/VenuePage.vue` - Carousel images need to use sport-specific gallery array
- `types/data.ts` - Venue interface needs to include `sportsGalleries` type definition

### Breaking changes

None - this change is backward compatible. Venues without `sportsGalleries` will continue to use the legacy `publicId` field.

### Benefits

- More accurate venue representation per sport type
- Better user experience with sport-appropriate imagery
- Leverages existing database structure without requiring data migration
- Maintains backward compatibility with legacy venue data
