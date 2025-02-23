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
}

.current-pokemon.catching {
  animation: catch-pokemon 1s ease-in-out;
}

.current-pokemon.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

@keyframes catch-pokemon {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(0.5) rotate(180deg);
    opacity: 0.7;
  }
  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>