<script setup lang="ts">
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

defineProps({
  modelValue: Date,
  placeholder: String,
  disabledDates: {
    type: Array as () => Date[],
    default: () => [],
  },
});
const emit = defineEmits(["update:modelValue"]);

function format(date: Date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day.toString().padStart(2, "0")}/${month
    .toString()
    .padStart(2, "0")}/${year}`;
}

function updateHandler(modelData: Date) {
  emit("update:modelValue", modelData);
}
</script>

<template>
  <fieldset class="fieldInputDate">
    <legend class="legend" :class="{ 'legend--selected': modelValue }">
      {{ placeholder }}
    </legend>
    <VueDatePicker
      :modelValue="modelValue"
      @update:model-value="updateHandler"
      :placeholder="placeholder"
      input-class-name="dp-custom-input"
      date
      :format="format"
      :min-date="new Date()"
      :max-date="$dayjs().add(1, 'month').format()"
      :enable-time-picker="false"
      :disabled-dates="disabledDates"
      auto-apply
      hide-offset-dates
    >
    </VueDatePicker>
  </fieldset>
</template>

<style lang="scss" scoped>
.fieldInputDate {
  border-color: $border-color;
  border-radius: $border-radius;
  border-width: $border-width;
  width: 100%;
  background: $functional-white;
  margin-inline-end: 0;
  margin-inline-start: 0;
  padding-inline-start: 2px;
  padding-inline-end: 2px;
  padding-block-start: 0px;
  padding-block-end: 8px;
  min-inline-size: 0;
  border-style: solid;
}

.legend {
  width: 0;
  visibility: hidden;
  border: 0;
  padding: 0;
  display: block;

  &--selected {
    width: auto;
    visibility: visible;
    padding-inline-start: 2px;
    padding-inline-end: 2px;
  }
}
</style>

<style lang="scss">
.dp-custom-input {
  border: none;
  font-weight: 400;

  &:hover {
    border-color: #1976d2;
  }

  &::placeholder {
    font-size: 1.1rem;
    font-family: $primary-font-stack;
    font-weight: 300;
    opacity: 0.5;
  }
}

.dp__pointer {
  font-weight: 500;
}

.dp__btn {
  font-weight: 500;
}
</style>
