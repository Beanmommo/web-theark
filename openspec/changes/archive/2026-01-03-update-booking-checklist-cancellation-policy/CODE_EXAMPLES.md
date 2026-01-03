# Code Examples

This document provides code examples for the proposed changes.

## Current Implementation (Before)

### BookingFormPage3CheckList.vue (Current)

```vue
<script setup lang="ts">
const terms = ref(false)
const covid = ref(false)
const emit = defineEmits(['update'])

function inputHandler()
{
  if (terms.value && covid.value)
    emit('update', true)
  else
    emit('update', false)
}
</script>

<template>
  <div class="bookingFormPage3CheckList">
    <!-- Checkbox 1: Always shown -->
    <v-checkbox v-model="terms" @input="inputHandler">
      <template v-slot:label>
        <div class="label">I accept the terms and conditions...</div>
      </template>
    </v-checkbox>
    
    <!-- Checkbox 2: Currently always shown, should be conditional -->
    <v-checkbox>
      <template v-slot:label>
        <div class="label">
          Providing more than <b>72 hours'</b> notice for rescheduling...
        </div>
      </template>
    </v-checkbox>
    
    <!-- Checkbox 3: Currently always shown, should be conditional -->
    <v-checkbox v-model="covid" @input="inputHandler">
      <template v-slot:label>
        <div class="label">
          Adhering to the inclement weather policy...
        </div>
      </template>
    </v-checkbox>
  </div>
</template>
```

## Proposed Implementation (After)

### BookingFormPage3CheckList.vue (Proposed)

```vue
<script setup lang="ts">
import type { GroupedTimeslots } from '~/types/data'

// Props
const props = defineProps({
  groupedTimeslots: {
    type: Object as PropType<GroupedTimeslots>,
    required: true,
  },
})

// Stores
const pitchesStore = usePitchesStore()
const locationsStore = useLocationsStore()
const { pitches } = storeToRefs(pitchesStore)
const { locations } = storeToRefs(locationsStore)

// Reactive state
const terms = ref(false)
const covid = ref(false)
const emit = defineEmits(['update'])

/**
 * Determines if cancellation is allowed for all selected slots
 * Returns false if ANY slot belongs to a pitch with allowCancellation: false
 */
const allowsCancellation = computed(() => {
  // Extract all slots from grouped timeslots
  const allSlots = Object.values(props.groupedTimeslots).flat()
  
  // Check each slot's pitch
  for (const slot of allSlots) {
    // Find the location
    const location = locations.value.find(loc => loc.name === slot.location)
    if (!location) continue
    
    // Find the pitch matching this slot
    const pitch = pitches.value.find(
      (p) =>
        p.locationKey === location.key &&
        p.name === String(slot.pitch) &&
        p.typeOfSports?.toLowerCase() === slot.typeOfSports?.toLowerCase()
    )
    
    // If pitch found and has allowCancellation explicitly set to false, disallow
    if (pitch && pitch.allowCancellation === false) {
      return false
    }
  }
  
  return true // Default: allow cancellation
})

/**
 * Validates form based on visible checkboxes
 */
function inputHandler() {
  if (allowsCancellation.value) {
    // All checkboxes visible: require terms AND covid
    if (terms.value && covid.value)
      emit('update', true)
    else
      emit('update', false)
  } else {
    // Only terms checkbox visible: require only terms
    if (terms.value)
      emit('update', true)
    else
      emit('update', false)
  }
}
</script>

<template>
  <div class="bookingFormPage3CheckList">
    <!-- Checkbox 1: Always shown -->
    <v-checkbox v-model="terms" @input="inputHandler">
      <template v-slot:label>
        <div class="label">I accept the terms and conditions...</div>
      </template>
    </v-checkbox>
    
    <!-- Checkbox 2: Conditionally shown based on cancellation policy -->
    <v-checkbox v-if="allowsCancellation">
      <template v-slot:label>
        <div class="label">
          Providing more than <b>72 hours'</b> notice for rescheduling...
        </div>
      </template>
    </v-checkbox>
    
    <!-- Checkbox 3: Conditionally shown based on cancellation policy -->
    <v-checkbox v-if="allowsCancellation" v-model="covid" @input="inputHandler">
      <template v-slot:label>
        <div class="label">
          Adhering to the inclement weather policy...
        </div>
      </template>
    </v-checkbox>
  </div>
</template>
```

### BookingFormPage3.vue (Parent Component Change)

```vue
<!-- Before -->
<BookingFormPage3CheckList @update="updateHandlerCheckList" />

<!-- After -->
<BookingFormPage3CheckList 
  :groupedTimeslots="groupedTimeslots"
  @update="updateHandlerCheckList" 
/>
```

## Reference: Existing Pattern

This implementation follows the same pattern used in `ProfileBookingCard.vue`:

```typescript
// From ProfileBookingCard.vue:151-170
const allowCancellation = computed(() => {
  for (const slot of bookingSlots.value) {
    const pitch = pitchesStore.pitches.find(
      (p) =>
        p.locationKey === location.key &&
        p.name === String(slot.pitch) &&
        p.typeOfSports?.toLowerCase() === slot.typeOfSports?.toLowerCase()
    );
    if (pitch && pitch.allowCancellation === false) {
      return false;
    }
  }
  return true;
});
```

