<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<'success' | 'error' | 'warning' | 'info'>,
    default: 'info',
  },
  timeout: {
    type: Number,
    default: 5000,
  },
  closable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const snackbarValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const snackbarColor = computed(() => {
  switch (props.type) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
});

const snackbarIcon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'warning':
      return 'mdi-alert';
    case 'info':
    default:
      return 'mdi-information';
  }
});
</script>

<template>
  <VSnackbar
    v-model="snackbarValue"
    :color="snackbarColor"
    :timeout="timeout"
    location="top"
    multi-line
  >
    <div class="d-flex align-center">
      <VIcon :icon="snackbarIcon" class="mr-3" />
      <span>{{ message }}</span>
    </div>

    <template v-if="closable" #actions>
      <VBtn
        variant="text"
        icon="mdi-close"
        @click="snackbarValue = false"
      />
    </template>
  </VSnackbar>
</template>

