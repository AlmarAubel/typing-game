<script setup lang="ts">
import { withDefaults, ref, watch } from "vue";

const props = withDefaults(defineProps<{
  isAnimating: boolean;
  clickPosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  isWrongAnswer?: boolean;
}>(), {
  targetPosition: () => ({ x: 0, y: 0 })
});

const pokeball = ref<HTMLElement | null>(null);

watch(
  () => props.clickPosition,
  (newPos) => {
    if (pokeball.value) {
      pokeball.value.style.left = `${newPos.x}px`;
      pokeball.value.style.top = `${newPos.y}px`;
      pokeball.value.style.transform = "translate(-50%, -50%)";
      const deltaX = props.targetPosition.x - newPos.x;
      const deltaY = props.targetPosition.y - newPos.y;
      pokeball.value.style.setProperty("--delta-x", `${deltaX}px`);
      pokeball.value.style.setProperty("--delta-y", `${deltaY}px`);
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
  /* CSS variables for dynamic animation */
  --delta-x: 0px;
  --delta-y: 0px;
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
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
  50% {
    transform: translate(calc(-50% + (var(--delta-x) / 2)), calc(-50% + (var(--delta-y) / 2) - 50px)) scale(1) rotate(0deg);
  }
  100% {
    transform: translate(calc(-50% + var(--delta-x)), calc(-50% + var(--delta-y))) scale(1) rotate(0deg);
  }
}

@keyframes throw-miss {
  0% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
  50% {
    transform: translate(calc(-50% + (var(--delta-x) / 2) - 20px), calc(-50% + (var(--delta-y) / 2) - 50px)) scale(0.95) rotate(20deg);
  }
  100% {
    transform: translate(calc(-50% + var(--delta-x)), calc(-50% + var(--delta-y))) scale(0.9) rotate(40deg);
  }
}
</style>