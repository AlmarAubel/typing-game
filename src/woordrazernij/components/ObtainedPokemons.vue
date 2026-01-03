<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-8">
      Obtained Pokemons ({{ store.state.obtainedPokemons.length }})
    </h1>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4"
    >
      <div
        v-for="pokemon in store.state.obtainedPokemons"
        :key="pokemon.id"
        class="bg-gray-50 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow"
      >
        <h2 class="text-lg font-semibold mb-2">{{ pokemon.name }}</h2>
        <img
          :src="pokemon.imgUrl"
          :alt="pokemon.name"
          class="w-full h-auto mb-2"
        />
        <span
          class="inline-block px-2 py-1 rounded text-sm"
          :class="{
            'bg-blue-100 text-blue-800': pokemon.rarity === 'common',
            'bg-yellow-100 text-yellow-800': pokemon.rarity === 'uncommon',
            'bg-red-100 text-red-800': pokemon.rarity === 'rare',
            'bg-gray-900 text-white': pokemon.rarity === 'legendary',
          }"
        >
          {{ pokemon.rarity }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePokemonStore } from "../store/pokemonStore";
const store = usePokemonStore();
</script>
