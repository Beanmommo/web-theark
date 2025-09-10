<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  modelValue: String,
  options: Array,
  placeholder: String

})
const emit = defineEmits(['update:modelValue'])
const showOptions = ref(false)

function clickHandler()
{
  showOptions.value = !showOptions.value
}

function clickOptionHandler(value: string)
{
  emit('update:modelValue', value)
  showOptions.value = !showOptions.value

}
</script>

<template>
  <fieldset class="fieldInputSelect">
    <legend class="legend" :class="{ 'legend--selected': modelValue }">{{ placeholder }}</legend>
    <div class="fieldContainer" @click="clickHandler">
      <div class="selected" v-if="modelValue">
        {{ modelValue }}
      </div>
      <div class="placeholder" v-else>
        {{ placeholder }}
      </div>
      <div class="arrow">
        <IconDown />
      </div>
    </div>
    <transition name="slide">
      <div class="options" v-show="showOptions">
        <template v-for="opt in options">
          <div class="option" @click="clickOptionHandler(opt.name)">{{ opt.name }}</div>
        </template>

      </div>
    </transition>

  </fieldset>
</template>

<style lang="scss" scoped>
.fieldInputSelect {
  border-color: $border-color;
  border-radius: $border-radius;
  border-width: $border-width;
  width: 100%;
  background: $functional-white;
  margin-inline-end: 0;
  margin-inline-start: 0;
  padding-inline-start: $unit;
  padding-inline-end: 2px;
  padding-block-start: 3px;
  padding-block-end: 10px;
  min-inline-size: 0;
  border-style: solid;
  position: relative;
  display: inline-block;
}

.fieldContainer {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 90% 10%;
  align-items: center;
  cursor: pointer;
  padding: 2px $unit;
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

.placeholder {
  color: $primary-grey;
  font-size: 1.1rem;
}

.selected {
  color: black;
  font-size: 1.1rem;
}

.arrow {
  color: black;
  width: 20px;
  height: 20px;
  justify-self: end;
}

.options {
  position: absolute;
  display: grid;
  margin-top: $margin;
  background: white;
  width: 100%;
  left: 0;
  box-shadow: $box-shadow;
  z-index: 99;

}

.option {
  font-size: 1.1rem;
  padding: $unit $margin;
  cursor: pointer;

  &:hover {
    background: $primary-grey;
  }
}

.slide-enter-active {
  transition-duration: 0.3s;
}

.slide-leave-active {
  transition-duration: 0.3s;
}

.slide-enter-to,
.slide-leave {
  max-height: 400px;
  overflow: hidden;
}

.slide-enter,
.slide-leave-to {
  overflow: hidden;
  max-height: 0;
}
</style>