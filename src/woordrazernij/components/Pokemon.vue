<!-- src/components/Pokemon.vue -->
<template>
  <div class="max-w-4xl mx-auto p-8 bg-gray-100 shadow-lg rounded-xl">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">My Pokemons</h1>
      <p class="text-xl font-bold">Beschikbare punten: {{ store.state.points }}</p>
    </div>

    <div class="flex flex-wrap justify-center gap-8">
      <div 
        v-for="pokeballType in Object.values(PokeballType)" 
        :key="pokeballType" 
        class="bg-white p-4 rounded-xl shadow-md text-center w-[150px]"
      >
        <div class="w-20 h-20 mx-auto mb-4">
          <img :src="`../assets/${pokeballType}.png`" :alt="pokeballType" class="max-w-full max-h-full">
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
          :src="obtainedPokemon.imgUrl" 
          :alt="obtainedPokemon.name"
          class="w-[150px] h-[150px] mx-auto mb-4"
        >
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

import { Pokemon, getPokemon } from "../utils/pokeDex";
const getImgUrl = (pokeballType: string) => new URL(`../assets/${pokeballType}.png`, import.meta.url).href;
const store = usePokemonStore();
const obtainedPokemon = ref<Pokemon>();

store.init();
const closeOverlay = () => {
  obtainedPokemon.value = undefined;
};

watch(
  () => store.state.obtainedPokemons,
  (newPokemons, oldPokemons) => {
    obtainedPokemon.value = newPokemons[newPokemons.length - 1];
  },
  { deep: true }
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

<style scoped>
.pokemon-app {
  font-family: "Arial", sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f3f3f3;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.pokeballs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
}

.pokeball {
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 150px;
}

.pokeball-image {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
}

.pokeball img {
  max-width: 100%;
  max-height: 100%;
}

button {
  background-color: #3b4cca;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  transition-duration: 0.4s;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #ccc;
  color: #777;
  cursor: not-allowed;
}

button:hover {
  background-color: #2c3792;
}

button:active {
  background-color: #1e2461;
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #3b4cca;
}

.obtained-pokemon {
  text-align: center;
  margin-top: 3rem;
}

.obtained-pokemon img {
  width: 150px;
  height: 150px;
}

/* ... previous CSS ... */

.pokemon-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.pokemon-details {
  position: relative;
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 300px;
  max-height: 90%;
  overflow-y: auto;
}

.pokemon-details img {
  width: 150px;
  height: 150px;
  margin-bottom: 1rem;
}

.pokemon-details button {
  margin-top: 1rem;
}

/*!* ... previous CSS ... *!*/

/*.header {*/
/*  display: flex;*/
/*  justify-content: space-between;*/
/*  align-items: center;*/
/*  margin-bottom: 2rem;*/
/*}*/

/*.points {*/
/*  font-size: 1.25rem;*/
/*  font-weight: bold;*/
/*}*/

/*.pokeball {*/
/*  background-color: #ffffff;*/
/*  padding: 1rem;*/
/*  border-radius: 10px;*/
/*  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);*/
/*  text-align: center;*/
/*  width: 130px;*/
/*}*/

/*.open-btn {*/
/*  background-color: #3b4cca;*/
/*  margin-top: 0.5rem;*/
/*}*/

/*.buy-btn {*/
/*  background-color: #f44336;*/
/*  margin-top: 0.5rem;*/
/*}*/

/*button.open-btn:hover,*/
/*button.buy-btn:hover {*/
/*  opacity: 0.8;*/
/*}*/

/*button.open-btn:disabled,*/
/*button.buy-btn:disabled {*/
/*  background-color: #ccc;*/
/*  color: #777;*/
/*  cursor: not-allowed;*/
/*}*/

/*!* ... rest of the CSS ... *!*/
</style>
