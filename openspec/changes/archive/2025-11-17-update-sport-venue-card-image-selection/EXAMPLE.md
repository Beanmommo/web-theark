# Implementation Example

## Data Structure

### Current Firebase Data (from JSON export)

```json
{
  "name": "Orchid Country Club",
  "publicId": "pitch_orchidcountryclub",
  "sportsGalleries": {
    "Futsal": {
      "gallery": [
        "website/pitch_orchidcountryclub",
        "orchid_country_club",
        "orchid_country_club_day"
      ],
      "public_id": "website/pitch_orchidcountryclub"
    },
    "Pickleball": {
      "gallery": ["website/pickleball"],
      "public_id": "website/pickleball"
    }
  }
}
```

## Type Definitions

### Before (types/data.ts)

```typescript
export interface Venue {
  active: boolean;
  address: string;
  bcc: string;
  contact: string;
  description: string;
  email: string;
  gallery: string[];
  key: string;
  lat: string;
  lng: string;
  name: string;
  publicId: string;
  tillMidnight: string;
}
```

### After (types/data.ts)

```typescript
export interface SportsGallery {
  gallery: string[];
  public_id: string;
}

export type SportsGalleries = Record<string, SportsGallery>;

export interface Venue {
  active: boolean;
  address: string;
  bcc: string;
  contact: string;
  description: string;
  email: string;
  gallery: string[];
  key: string;
  lat: string;
  lng: string;
  name: string;
  publicId: string;
  tillMidnight: string;
  sportsGalleries?: SportsGalleries; // NEW: Optional for backward compatibility
}
```

## Component Implementation

### Before (SportVenueCardItem.vue)

```vue
<template>
  <div class="venueCardItem">
    <template v-if="props.venue">
      <CldImage
        :src="`website/${props.venue.publicId}`"
        width="800"
        height="600"
        :alt="props.venue.name"
        @click="clickHandlerViewVenue"
      />
      <!-- rest of template -->
    </template>
  </div>
</template>
```

### After (SportVenueCardItem.vue)

```vue
<script setup lang="ts">
import { type Venue } from "../types/data";
import type { PropType } from "vue";

const props = defineProps({
  venue: {
    type: Object as PropType<Venue>,
    required: true,
  },
  sportSlug: {
    type: String,
    required: true,
  },
});

// Helper function to capitalize sport name for gallery lookup
const capitalizeSportName = (slug: string): string => {
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
};

// Computed property to get sport-specific image or fallback to legacy publicId
const venueImageSrc = computed(() => {
  // Check if sportsGalleries exists and has data for the current sport
  if (props.venue.sportsGalleries) {
    const sportName = capitalizeSportName(props.sportSlug);
    const sportGallery = props.venue.sportsGalleries[sportName];

    if (sportGallery?.public_id) {
      // Use sport-specific public_id (already includes 'website/' prefix in data)
      return sportGallery.public_id;
    }
  }

  // Fallback to legacy publicId
  return `website/${props.venue.publicId}`;
});

// ... rest of component logic
</script>

<template>
  <div class="venueCardItem">
    <template v-if="props.venue">
      <CldImage
        :src="venueImageSrc"
        width="800"
        height="600"
        :alt="props.venue.name"
        @click="clickHandlerViewVenue"
      />
      <!-- rest of template -->
    </template>
  </div>
</template>
```

## VenuePage Carousel Implementation

### Before (VenuePage.vue - carouselImages computed)

```typescript
const carouselImages = computed(() => {
  const images: string[] = [];

  // Add main publicId image first if it exists
  if (selectedVenue.value?.publicId) {
    images.push(
      `https://res.cloudinary.com/thearksg/image/upload/website/${selectedVenue.value.publicId}`
    );
  }

  // Add gallery images
  if (selectedVenue.value?.gallery && selectedVenue.value.gallery.length > 0) {
    selectedVenue.value.gallery.forEach((image) => {
      images.push(`https://res.cloudinary.com/thearksg/image/upload/${image}`);
    });
  }

  return images;
});
```

### After (VenuePage.vue - carouselImages computed)

```typescript
// Helper function to capitalize sport name (can be shared or duplicated)
const capitalizeSportName = (slug: string): string => {
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
};

const carouselImages = computed(() => {
  const images: string[] = [];

  // Try to use sport-specific gallery first
  if (selectedVenue.value?.sportsGalleries && sport) {
    const sportName = capitalizeSportName(sport);
    const sportGallery = selectedVenue.value.sportsGalleries[sportName];

    if (sportGallery?.gallery && sportGallery.gallery.length > 0) {
      // Use sport-specific gallery images
      sportGallery.gallery.forEach((image) => {
        // Handle both formats: with or without 'website/' prefix
        const imageUrl = image.startsWith("website/")
          ? `https://res.cloudinary.com/thearksg/image/upload/${image}`
          : `https://res.cloudinary.com/thearksg/image/upload/${image}`;
        images.push(imageUrl);
      });

      return images;
    }
  }

  // Fallback to legacy behavior
  // Add main publicId image first if it exists
  if (selectedVenue.value?.publicId) {
    images.push(
      `https://res.cloudinary.com/thearksg/image/upload/website/${selectedVenue.value.publicId}`
    );
  }

  // Add gallery images
  if (selectedVenue.value?.gallery && selectedVenue.value.gallery.length > 0) {
    selectedVenue.value.gallery.forEach((image) => {
      images.push(`https://res.cloudinary.com/thearksg/image/upload/${image}`);
    });
  }

  return images;
});
```

## Usage Examples

### Example 1: SportVenueCardItem - Futsal Venue Listing

- URL: `/futsal/venue`
- Sport Slug: `futsal`
- Capitalized: `Futsal`
- Image Source: `website/pitch_orchidcountryclub` (from `sportsGalleries.Futsal.public_id`)

### Example 2: SportVenueCardItem - Pickleball Venue Listing

- URL: `/pickleball/venue`
- Sport Slug: `pickleball`
- Capitalized: `Pickleball`
- Image Source: `website/pickleball` (from `sportsGalleries.Pickleball.public_id`)

### Example 3: VenuePage Carousel - Futsal Venue Detail

- URL: `/futsal/venue/-LfUXl4abLReznXVYKVP`
- Sport Slug: `futsal`
- Capitalized: `Futsal`
- Carousel Images:
  1. `https://res.cloudinary.com/thearksg/image/upload/website/pitch_orchidcountryclub`
  2. `https://res.cloudinary.com/thearksg/image/upload/orchid_country_club`
  3. `https://res.cloudinary.com/thearksg/image/upload/orchid_country_club_day`
- Source: `sportsGalleries.Futsal.gallery` array

### Example 4: VenuePage Carousel - Pickleball Venue Detail

- URL: `/pickleball/venue/-LfUXl4abLReznXVYKVP`
- Sport Slug: `pickleball`
- Capitalized: `Pickleball`
- Carousel Images:
  1. `https://res.cloudinary.com/thearksg/image/upload/website/pickleball`
- Source: `sportsGalleries.Pickleball.gallery` array

### Example 5: Legacy Venue (no sportsGalleries)

- Sport Slug: `futsal`
- Card Image Source: `website/pitch_orchidcountryclub` (from legacy `publicId`)
- Carousel Images: Legacy `publicId` + `gallery` array
- Behavior: Same as before, fully backward compatible
