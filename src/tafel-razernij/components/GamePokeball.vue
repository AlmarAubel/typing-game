<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  isAnimating: boolean;
  clickPosition: { x: number; y: number };
}>();

const pokeball = ref<HTMLElement | null>(null);
const rotation = ref(0);

onMounted(() => {
  if (pokeball.value) {
    pokeball.value.style.left = `${props.clickPosition.x}px`;
    pokeball.value.style.top = `${props.clickPosition.y}px`;
  }
});
</script>

<template>
  <img
    ref="pokeball"
    src="/pokeball.png"
    alt="Pokeball"
    class="w-12 h-12 absolute left-1/2 bottom-8 -translate-x-1/2 transition-all duration-300 z-20"
    :class="{ 'animate-spin': isAnimating }"
    :style="{
      transform: `translateX(-50%) rotate(${rotation}deg)`,
    }"
  />
</template>