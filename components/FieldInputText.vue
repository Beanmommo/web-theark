<script setup lang="ts">

defineProps({
  modelValue: String,
  placeholder: String
})
const emit = defineEmits(['update:modelValue'])



function inputHandler(event: Event)
{
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <fieldset class="fieldInputText">
    <legend class="legend" :class="{ 'legend--selected': modelValue }">{{ placeholder }}</legend>
    <input class="input" @input="event => inputHandler(event)" :placeholder="placeholder" />
  </fieldset>
</template>

<style lang="scss" scoped>
.fieldInputText {
  border-color: $border-color;
  border-radius: $border-radius;
  border-width: $border-width;
  width: 100%;
  background: $functional-white;
  margin-inline-end: 0;
  margin-inline-start: 0;
  padding-inline-start: 10px;
  padding-inline-end: 2px;
  padding-block-start: 0px;
  padding-block-end: 16px;
  min-inline-size: 0;
  border-style: solid;
}

.legend {
  width: 0;
  visibility: hidden;
  border: 0;
  padding: 0;

  &--selected {
    width: auto;
    visibility: visible;


  }
}

.input {
  border: 0;
  font-size: 1.1rem;
  font-family: $primary-font-stack;
  font-weight: 300;

  &:focus {
    outline: none;
  }

  &::placeholder {
    opacity: 0.5;
    color: red;
  }
}
</style>