<template>
  <input type="text" id="hiddenInput" style="position: absolute; opacity: 0" ref="inputElement" @input="handleInput" />
  <button @click="toggleKeyboard()" class="button is-info">⌨️</button>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

const emit = defineEmits(["keypressed"]);
const props = defineProps({
  showKeyboard: Boolean,
});

watch(
  () => props.showKeyboard,
  (v) => (v ? toggleKeyboard() : showKeyboard())
);

const inputElement = ref<HTMLInputElement>();
const keyBoardisShowed = computed(() => inputElement.value === document.activeElement);

function handleInput(event: any) {
  emit("keypressed", event);
}

function toggleKeyboard() {
  if (keyBoardisShowed.value) return hideKeyboard();
  return showKeyboard();
}

function showKeyboard() {
  inputElement.value?.focus();
}

function hideKeyboard() {
  inputElement.value?.blur();
}
</script>

<style scoped></style>
