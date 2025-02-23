<script setup lang="ts">
interface Pokemon {
  id: number;
  sprite: string;
  name: string;
  cry: string;
}

const props = defineProps<{
  pokemon: Pokemon;
  position: { x: number; y: number };
  isCatching: boolean;
  isWrongAnswer: boolean;
}>();
</script>

<template>
  <div
    class="absolute z-10"
    :style="{
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: 'translate(-50%, -50%)',
    }"
  >
    <img
      :src="pokemon.sprite"
      :alt="'Pokemon #' + pokemon.id"
      class="current-pokemon"
      :class="{
        catching: isCatching,
        'animate-shake': isWrongAnswer,
      }"
    />
    <div v-if="isWrongAnswer" class="pulse-effect"></div>
  </div>
</template>

<style scoped>
.current-pokemon {
  width: 120px;
  height: 120px;
  z-index: 15;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  image-rendering: pixelated;
  animation: float 3s ease-in-out infinite;
  will-change: transform;
}

.current-pokemon.catching {
  animation: catch-pokemon 0.85s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}

.current-pokemon.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.pulse-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 0, 0, 0.2) 0%, rgba(255, 0, 0, 0) 70%);
  border-radius: 50%;
  z-index: 14;
  animation: pulse 0.5s cubic-bezier(0.2, 0.8, 0.4, 1) both;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(3deg);
  }
}

@keyframes catch-pokemon {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  40% {
    transform: scale(0.7) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: scale(0.4) rotate(360deg);
    opacity: 0.4;
  }
  100% {
    transform: scale(0) rotate(540deg);
    opacity: 0;
  }
}

@keyframes shake {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  15% { transform: translate3d(-3px, -2px, 0) rotate(-2deg); }
  30% { transform: translate3d(5px, 1px, 0) rotate(3deg); }
  45% { transform: translate3d(-4px, -1px, 0) rotate(-1deg); }
  60% { transform: translate3d(3px, 2px, 0) rotate(2deg); }
  75% { transform: translate3d(-2px, -1px, 0) rotate(-1deg); }
  90% { transform: translate3d(1px, 1px, 0) rotate(1deg); }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  40% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0;
  }
}
</style>