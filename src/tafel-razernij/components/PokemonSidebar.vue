<script setup lang="ts">
import { usePokemonStore } from "../stores/pokemon";
import { computed } from "vue";

const props = defineProps<{
  columns?: number;
}>();

const pokemonStore = usePokemonStore();
const sortedPokemons = computed(() => [...pokemonStore.collection].reverse());

const gridColumns = computed(() => ({
  "grid-cols-2": !props.columns || props.columns === 2,
  "grid-cols-3": props.columns === 3,
  "grid-cols-4": props.columns === 4,
}));

function playPokemonCry(pokemon: { cry?: string }) {
  if (pokemon.cry) {
    const audio = new Audio(pokemon.cry);
    audio.play();
  }
}
</script>

<template>
  <div class="bg-white/95 p-4 rounded-xl shadow-lg overflow-y-auto mb-4">
    <h3 class="text-lg font-semibold text-gray-800">Gevangen Pokemon ({{ pokemonStore.collection.length }})</h3>
    <div class="grid gap-2 mt-4 p-2 pb-8" :class="gridColumns">
      <div v-for="pokemon in sortedPokemons" :key="pokemon.id" class="relative rounded-lg overflow-hidden transform hover:-translate-y-0.5 transition-transform duration-200">
        <div class="relative bg-gradient-to-b from-gray-100 to-white p-1 rounded-lg shadow-sm">
          <div class="w-32 h-32 mx-auto">
            <img :src="pokemon.sprite" :alt="pokemon.name" class="w-full h-full object-contain block" />
          </div>
          <span class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 px-1 text-center capitalize">
            {{ pokemon.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
