<template>
  <div class="max-w-4xl mx-auto p-8 bg-gray-100 shadow-lg rounded-xl">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">My Pokemons</h1>
      <p class="text-xl font-bold">
        Beschikbare punten: {{ store.state.points }}
      </p>
    </div>

    <div class="flex flex-wrap justify-center gap-8">
      <div
        v-for="pokeballType in Object.values(PokeballType)"
        :key="pokeballType"
        class="bg-white p-4 rounded-xl shadow-md text-center w-[150px]"
      >
        <div class="w-20 h-20 mx-auto mb-4">
          <img
            :src="getImgUrl(pokeballType)"
            :alt="pokeballType"
            class="max-w-full max-h-full"
          />
        </div>
        <h2 class="text-lg font-semibold mb-2">{{ pokeballType }}</h2>
        <p class="mb-4">Amount: {{ store.state.pokeballs[pokeballType] }}</p>
        <button
          @click="() => store.openPokeball(pokeballType)"
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Open {{ pokeballType }}
        </button>
        <button
          :disabled="!canBuy(pokeballType)"
          @click="buyPokeball(pokeballType)"
          class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Koop voor {{ getPrice(pokeballType) }} punten
        </button>
      </div>
    </div>

    <div
      v-if="obtainedPokemon"
      class="fixed inset-0 bg-black/50 flex justify-center items-center z-10"
      @click="closeOverlay"
    >
      <div
        class="relative bg-white p-8 rounded-xl shadow-xl text-center w-[300px] max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h3 class="text-xl font-bold mb-4">{{ obtainedPokemon.name }}</h3>
        <img
          :src="obtainedPokemon.imageUrl"
          :alt="obtainedPokemon.name"
          class="w-[150px] h-[150px] mx-auto mb-4"
        />
        <button
          @click="closeOverlay"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { usePokemonStore } from "../store/pokemonStore";
import { PokeballType } from "../utils/pokemonUtils";

import { type Pokemon } from "../utils/pokeDex";
const getImgUrl = (pokeballType: string) =>
  `/assets/${pokeballType.toLowerCase()}.png`;
const store = usePokemonStore();
const obtainedPokemon = ref<Pokemon>();

store.init();
const closeOverlay = () => {
  obtainedPokemon.value = undefined;
};

watch(
  () => store.state.obtainedPokemons,
  (newPokemons) => {
    obtainedPokemon.value = newPokemons[newPokemons.length - 1];
  },
  { deep: true },
);

const pokeballPrices = {
  [PokeballType.POKEBALL]: 10,
  [PokeballType.GREATBALL]: 30,
  [PokeballType.ULTRABALL]: 50,
  [PokeballType.MASTERBALL]: 100,
};

const getPrice = (pokeballType: PokeballType) => {
  return pokeballPrices[pokeballType];
};

const canBuy = (pokeballType: PokeballType) => {
  return store.state.points >= getPrice(pokeballType);
};

const buyPokeball = (pokeballType: PokeballType) => {
  if (canBuy(pokeballType)) {
    store.buyPokeball(pokeballType, getPrice(pokeballType));
  }
};
</script>
