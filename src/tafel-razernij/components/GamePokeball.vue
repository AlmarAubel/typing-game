<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isAnimating: boolean;
  clickPosition: { x: number; y: number };
  isWrongAnswer?: boolean;
}>();

const pokeball = ref<HTMLElement | null>(null);

watch(
  () => props.clickPosition,
  (newPos) => {
    if (pokeball.value) {
      pokeball.value.style.left = `${newPos.x}px`;
      pokeball.value.style.top = `${newPos.y}px`;
      pokeball.value.style.transform = "translate(-50%, -50%)";
      pokeball.value.style.setProperty("--throw-height", `${-newPos.y}px`);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div 
    ref="pokeball"
    class="absolute z-20"
    :class="{ 'hidden': !isAnimating }"
  >
    <img
      src="/pokeball.png"
      alt="Pokeball"
      class="pokeball w-12 h-12 drop-shadow-lg"
      :class="{
        'pokeball-throw': isAnimating && !isWrongAnswer,
        'pokeball-throw-miss': isAnimating && isWrongAnswer
      }"
    />
  </div>
</template>

<style scoped>
.pokeball {
  transform-origin: center center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  will-change: transform;
  --throw-height: 0px;
}

.pokeball-throw {
  animation: throw 0.65s cubic-bezier(0.45, 0, 0.55, 1) forwards;
}

.pokeball-throw-miss {
  animation: throw-miss 0.8s cubic-bezier(0.45, 0, 0.55, 1) forwards;
  animation-iteration-count: 1;
}

@keyframes throw {
  0% {
    transform: scale(1) translateY(0) rotate(0deg);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  40% {
    transform: scale(0.9) translateY(calc(var(--throw-height) * 0.6)) rotate(240deg);
    filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.12));
  }
  70% {
    transform: scale(0.8) translateY(calc(var(--throw-height) * 0.9)) rotate(480deg);
    filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.1));
  }
  100% {
    transform: scale(0.6) translateY(var(--throw-height)) rotate(720deg);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
}

@keyframes throw-miss {
  0% {
    transform: scale(1) translate(0, 0) rotate(0deg);
  }
  40% {
    transform: scale(0.9) translate(-40px, calc(var(--throw-height) * 0.8)) rotate(360deg);
  }
  60% {
    transform: scale(0.8) translate(-30px, calc(var(--throw-height) * 0.6)) rotate(540deg);
  }
  80% {
    transform: scale(0.75) translate(-15px, calc(var(--throw-height) * 0.2)) rotate(630deg);
  }
  100% {
    transform: scale(0.7) translate(0, 0) rotate(720deg);
  }
}
</style>