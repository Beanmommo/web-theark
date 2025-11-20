<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  confirmColor: {
    type: String,
    default: 'error',
  },
  maxWidth: {
    type: String,
    default: '500',
  },
  persistent: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const dialogValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function handleConfirm() {
  emit('confirm');
  dialogValue.value = false;
}

function handleCancel() {
  emit('cancel');
  dialogValue.value = false;
}
</script>

<template>
  <VDialog
    v-model="dialogValue"
    :max-width="maxWidth"
    :persistent="persistent"
  >
    <VCard>
      <!-- Header -->
      <VCardTitle class="text-h5 font-weight-bold">
        {{ title }}
      </VCardTitle>

      <!-- Content -->
      <VCardText>
        <div class="text-body-1 mb-2">
          {{ message }}
        </div>
        <div v-if="details" class="text-body-2 text-medium-emphasis">
          {{ details }}
        </div>
      </VCardText>

      <!-- Actions -->
      <VCardActions class="px-4 pb-4">
        <VSpacer />
        <VBtn
          variant="text"
          @click="handleCancel"
        >
          {{ cancelText }}
        </VBtn>
        <VBtn
          :color="confirmColor"
          variant="flat"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

