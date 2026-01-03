<template>
  <button
    @click="toggleKeyboard()"
    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
  >
    ⌨️
  </button>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const emit = defineEmits(["keypressed"]);
const props = defineProps({
  showKeyboard: Boolean,
});

watch(
  () => props.showKeyboard,
  (v) => (v ? toggleKeyboard() : showKeyboard()),
);

const inputElement = ref<HTMLInputElement>();
const keyBoardisShowed = computed(
  () => inputElement.value === document.activeElement,
);


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
