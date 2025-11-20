<script setup lang="ts">
/**
 * Global alert component that listens to the useAlert composable
 * Add this component to your layout to enable global alerts
 */
const { alertState, hideAlert } = useAlert();

const showSnackbar = computed({
  get: () => alertState.value.show,
  set: (value) => {
    if (!value) hideAlert();
  },
});
</script>

<template>
  <AlertSnackbar
    v-model="showSnackbar"
    :message="alertState.message"
    :type="alertState.type"
    :timeout="alertState.timeout"
  />
</template>

