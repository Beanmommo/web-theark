# Custom Dialog and Alert System Specification

## Overview

This specification defines the custom confirmation dialog and alert snackbar system that replaces browser native `confirm()` and `alert()` calls throughout the application.

## Components

### 1. ConfirmDialog Component

**File**: `components/ConfirmDialog.vue`

**Purpose**: Reusable confirmation dialog for user confirmations.

**Props**:

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `modelValue` | Boolean | No | `false` | Controls dialog visibility (v-model) |
| `title` | String | Yes | - | Dialog title |
| `message` | String | Yes | - | Main confirmation message |
| `details` | String | No | `''` | Additional details or context |
| `confirmText` | String | No | `'Confirm'` | Text for confirm button |
| `cancelText` | String | No | `'Cancel'` | Text for cancel button |
| `confirmColor` | String | No | `'error'` | Vuetify color for confirm button |
| `maxWidth` | String | No | `'500'` | Maximum width of dialog in pixels |
| `persistent` | Boolean | No | `false` | Prevent closing by clicking outside |

**Events**:

- `@update:modelValue` - Emitted when dialog visibility changes
- `@confirm` - Emitted when user clicks confirm button
- `@cancel` - Emitted when user clicks cancel button

**Behavior**:

1. Dialog automatically closes when confirm or cancel is clicked
2. Emits appropriate event before closing
3. Can be controlled externally via v-model
4. Uses Vuetify VDialog, VCard, VCardTitle, VCardText, VCardActions components

---

### 2. AlertSnackbar Component

**File**: `components/AlertSnackbar.vue`

**Purpose**: Display alert messages at the top of the screen.

**Props**:

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `modelValue` | Boolean | No | `false` | Controls snackbar visibility (v-model) |
| `message` | String | Yes | - | Alert message to display |
| `type` | String | No | `'info'` | Alert type: `'success'`, `'error'`, `'warning'`, `'info'` |
| `timeout` | Number | No | `5000` | Auto-hide timeout in milliseconds |
| `closable` | Boolean | No | `true` | Show close button |

**Events**:

- `@update:modelValue` - Emitted when snackbar visibility changes

**Type Styling**:

| Type | Color | Icon |
|------|-------|------|
| `success` | Green (Vuetify success) | `mdi-check-circle` |
| `error` | Red (Vuetify error) | `mdi-alert-circle` |
| `warning` | Orange (Vuetify warning) | `mdi-alert` |
| `info` | Blue (Vuetify info) | `mdi-information` |

**Behavior**:

1. Appears at top of screen
2. Auto-dismisses after timeout
3. Can be manually closed if `closable` is true
4. Shows icon based on type
5. Uses Vuetify VSnackbar component

---

### 3. GlobalAlert Component

**File**: `components/GlobalAlert.vue`

**Purpose**: Global alert wrapper that listens to the `useAlert` composable.

**Implementation**:

- Added to `layouts/default.vue` inside `<ClientOnly>` wrapper
- Automatically renders AlertSnackbar based on global alert state
- No props or events (controlled by composable)

**Location in Layout**:

```vue
<template>
  <ClientOnly>
    <PromotionDialog />
    <GlobalAlert />  <!-- Global alert system -->
  </ClientOnly>
  <LayoutBase>
    ...
  </LayoutBase>
</template>
```

---

### 4. useAlert Composable

**File**: `composables/useAlert.ts`

**Purpose**: Provide global alert management across the application.

**API**:

```typescript
interface AlertState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timeout: number;
}

const useAlert = () => {
  // Show alert with custom type
  showAlert(message: string, type: AlertType, timeout?: number): void
  
  // Convenience methods
  showSuccess(message: string, timeout?: number): void
  showError(message: string, timeout?: number): void
  showWarning(message: string, timeout?: number): void
  showInfo(message: string, timeout?: number): void
  
  // Hide current alert
  hideAlert(): void
  
  // Read-only alert state
  alertState: Readonly<Ref<AlertState>>
}
```

**State Management**:

- Uses Vue `ref` for reactive state
- State is shared across all components
- Only one alert can be shown at a time (new alerts replace current)

---

## Usage Examples

### Example 1: Confirmation Dialog

```vue
<script setup lang="ts">
const showDeleteDialog = ref(false);

function handleDelete() {
  showDeleteDialog.value = true;
}

function handleConfirmDelete() {
  // Perform delete action
  console.log('Item deleted');
}
</script>

<template>
  <VBtn @click="handleDelete">Delete</VBtn>
  
  <ConfirmDialog
    v-model="showDeleteDialog"
    title="Delete Item"
    message="Are you sure you want to delete this item?"
    details="This action cannot be undone."
    confirm-text="Yes, Delete"
    cancel-text="Cancel"
    confirm-color="error"
    @confirm="handleConfirmDelete"
  />
</template>
```

### Example 2: Global Alerts

```vue
<script setup lang="ts">
const { showSuccess, showError } = useAlert();

async function saveData() {
  try {
    await $fetch('/api/save', { method: 'POST', body: data });
    showSuccess('Data saved successfully!');
  } catch (error) {
    showError('Failed to save data. Please try again.');
  }
}
</script>

<template>
  <VBtn @click="saveData">Save</VBtn>
</template>
```

---

## Migration from Browser Dialogs

### Before (Browser Native):

```javascript
const confirmed = confirm('Are you sure you want to delete this?');
if (!confirmed) return;

// Perform action
alert('Item deleted successfully!');
```

### After (Custom Components):

```vue
<script setup lang="ts">
const showDialog = ref(false);
const { showSuccess } = useAlert();

function handleDelete() {
  showDialog.value = true;
}

function handleConfirm() {
  // Perform action
  showSuccess('Item deleted successfully!');
}
</script>

<template>
  <ConfirmDialog
    v-model="showDialog"
    title="Confirm Delete"
    message="Are you sure you want to delete this?"
    @confirm="handleConfirm"
  />
</template>
```

---

## Implementation Status

- ✅ ConfirmDialog.vue created
- ✅ AlertSnackbar.vue created
- ✅ GlobalAlert.vue created
- ✅ useAlert.ts composable created
- ✅ GlobalAlert added to layouts/default.vue
- ✅ ProfileBookingCard.vue migrated to use custom components
- ✅ Documentation created (docs/DIALOG_ALERT_USAGE.md)
- ⏳ Testing in progress
- ⏳ Migration of other browser dialogs pending

---

## Testing Checklist

- [ ] ConfirmDialog displays with correct title and message
- [ ] ConfirmDialog confirm button triggers @confirm event
- [ ] ConfirmDialog cancel button triggers @cancel event
- [ ] ConfirmDialog closes after confirm/cancel
- [ ] AlertSnackbar displays with correct message and type
- [ ] AlertSnackbar shows correct icon for each type
- [ ] AlertSnackbar auto-dismisses after timeout
- [ ] AlertSnackbar can be manually closed
- [ ] GlobalAlert works from any component
- [ ] Multiple alerts queue correctly (new replaces old)
- [ ] Components are mobile responsive
- [ ] Components match Vuetify theme
- [ ] Accessibility (keyboard navigation, screen readers)

