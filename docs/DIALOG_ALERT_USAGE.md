# Custom Dialog and Alert Components

This document explains how to use the custom confirmation dialog and alert snackbar components.

## Components

### 1. ConfirmDialog
A reusable confirmation dialog component for user confirmations.

### 2. AlertSnackbar
A snackbar component for showing alerts at the top of the screen.

### 3. GlobalAlert
A global alert component that works with the `useAlert` composable.

---

## Usage

### ConfirmDialog

Use this component when you need user confirmation before performing an action.

**Example:**

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

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | Boolean | `false` | Controls dialog visibility |
| `title` | String | Required | Dialog title |
| `message` | String | Required | Main message |
| `details` | String | `''` | Additional details (optional) |
| `confirmText` | String | `'Confirm'` | Confirm button text |
| `cancelText` | String | `'Cancel'` | Cancel button text |
| `confirmColor` | String | `'error'` | Confirm button color |
| `maxWidth` | String | `'500'` | Dialog max width |
| `persistent` | Boolean | `false` | Prevent closing by clicking outside |

**Events:**

- `@confirm` - Emitted when user clicks confirm button
- `@cancel` - Emitted when user clicks cancel button
- `@update:modelValue` - Emitted when dialog visibility changes

---

### AlertSnackbar (Direct Usage)

Use this component directly when you need a one-off alert in a specific component.

**Example:**

```vue
<script setup lang="ts">
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref<'success' | 'error' | 'warning' | 'info'>('success');

function showSuccessMessage() {
  alertMessage.value = 'Operation completed successfully!';
  alertType.value = 'success';
  showAlert.value = true;
}
</script>

<template>
  <VBtn @click="showSuccessMessage">Show Success</VBtn>
  
  <AlertSnackbar
    v-model="showAlert"
    :message="alertMessage"
    :type="alertType"
    :timeout="5000"
  />
</template>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | Boolean | `false` | Controls snackbar visibility |
| `message` | String | Required | Alert message |
| `type` | String | `'info'` | Alert type: `'success'`, `'error'`, `'warning'`, `'info'` |
| `timeout` | Number | `5000` | Auto-hide timeout in milliseconds |
| `closable` | Boolean | `true` | Show close button |

---

### GlobalAlert (Recommended)

Use the `useAlert` composable for global alerts. This is the recommended approach.

**Setup:**

The `GlobalAlert` component is already added to `layouts/default.vue`, so it's available globally.

**Example:**

```vue
<script setup lang="ts">
const { showSuccess, showError, showWarning, showInfo } = useAlert();

async function saveData() {
  try {
    // Perform save operation
    await $fetch('/api/save', { method: 'POST', body: data });
    showSuccess('Data saved successfully!');
  } catch (error) {
    showError('Failed to save data. Please try again.');
  }
}

function showWarningExample() {
  showWarning('This action requires confirmation.');
}

function showInfoExample() {
  showInfo('New features are available!');
}
</script>

<template>
  <VBtn @click="saveData">Save</VBtn>
  <VBtn @click="showWarningExample">Show Warning</VBtn>
  <VBtn @click="showInfoExample">Show Info</VBtn>
</template>
```

**API:**

```typescript
const { 
  showSuccess,  // (message: string, timeout?: number) => void
  showError,    // (message: string, timeout?: number) => void
  showWarning,  // (message: string, timeout?: number) => void
  showInfo,     // (message: string, timeout?: number) => void
  showAlert,    // (message: string, type: AlertType, timeout?: number) => void
  hideAlert     // () => void
} = useAlert();
```

---

## Real-World Example

See `components/ProfileBookingCard.vue` for a complete example of using both components together:

```vue
<script setup lang="ts">
const showCancelDialog = ref(false);
const { showSuccess, showError } = useAlert();

function handleClickCancel() {
  showCancelDialog.value = true;
}

async function handleConfirmCancel() {
  try {
    await bookingsStore.cancelBooking(booking.key);
    showSuccess('Booking cancelled successfully. Credits have been added to your account.');
  } catch (error) {
    showError('Failed to cancel booking. Please try again or contact support.');
  }
}
</script>

<template>
  <VBtn @click="handleClickCancel">Cancel Booking</VBtn>
  
  <ConfirmDialog
    v-model="showCancelDialog"
    title="Cancel Booking"
    message="Are you sure you want to cancel this booking?"
    :details="`You will receive $${booking.subtotal} credits...`"
    confirm-text="Yes, Cancel Booking"
    cancel-text="No, Keep Booking"
    @confirm="handleConfirmCancel"
  />
</template>
```

---

## Migration from Browser Dialogs

**Before:**
```javascript
const confirmed = confirm('Are you sure?');
if (!confirmed) return;
// Do something
alert('Success!');
```

**After:**
```javascript
const showDialog = ref(false);
const { showSuccess } = useAlert();

function handleAction() {
  showDialog.value = true;
}

function handleConfirm() {
  // Do something
  showSuccess('Success!');
}
```

```vue
<template>
  <ConfirmDialog
    v-model="showDialog"
    title="Confirm Action"
    message="Are you sure?"
    @confirm="handleConfirm"
  />
</template>
```

