<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  options?: number[];
  isAnimating: boolean;
  practiceType: string;
}>();

const emit = defineEmits<{
  (e: 'check-answer', answer: number, event: MouseEvent | null): void;
}>();

const answer = ref("");
const answerInput = ref<HTMLInputElement | null>(null);

const handleAnswer = (value: number | string, event: MouseEvent | null = null) => {
  emit('check-answer', Number(value), event);
  if (props.practiceType === "open") {
    answer.value = "";
    setTimeout(() => {
      answerInput.value?.focus();
    }, 0);
  }
};
</script>

<template>
  <div class="absolute bottom-8 left-0 right-0 z-30">
    <template v-if="practiceType === 'multiple-choice'">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto px-4">
        <button
          v-for="option in options"
          :key="option"
          @click="(e: MouseEvent) => handleAnswer(option, e)"
          :disabled="isAnimating"
          class="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-xl font-bold transition-colors"
        >
          {{ option }}
        </button>
      </div>
    </template>

    <template v-else>
      <div class="flex justify-center space-x-4 max-w-md mx-auto px-4">
        <input
          ref="answerInput"
          type="number"
          v-model="answer"
          @keyup.enter="handleAnswer(answer, null)"
          :disabled="isAnimating"
          placeholder="Type je antwoord..."
          class="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          @click="(e: MouseEvent) => handleAnswer(answer, e)"
          :disabled="isAnimating"
          class="submit-button px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-xl font-bold transition-colors"
        >
          ✓
        </button>
      </div>
    </template>
  </div>
</template>