<template>
  <div class="max-w-4xl mx-auto p-8 bg-gray-100 shadow-lg rounded-xl">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">🛒 Pokemon Shop</h1>
      <div class="text-right">
        <p class="text-xl font-bold text-yellow-600">
          💰 {{ pokemonStore.state.points }} punten
        </p>
        <p class="text-sm text-gray-600">
          Verdiend met: {{ gameStats.woordrazernij.totalPoints + gameStats.tafelV2.totalPoints }} punten
        </p>
      </div>
    </div>

    <!-- Game Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-semibold text-purple-600 mb-2">📝 Woord Razernij Stats</h3>
        <div class="space-y-1">
          <p>Woorden getypt: {{ gameStats.woordrazernij.correctWords }}/{{ gameStats.woordrazernij.totalWords }}</p>
          <p>Punten verdiend: {{ gameStats.woordrazernij.totalPoints }}</p>
          <p v-if="gameStats.woordrazernij.totalWords > 0">
            Accuratie: {{ Math.round((gameStats.woordrazernij.correctWords / gameStats.woordrazernij.totalWords) * 100) }}%
          </p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-semibold text-red-600 mb-2">🚀 Tafel Razernij V2 Stats</h3>
        <div class="space-y-1">
          <p>Sommen correct: {{ gameStats.tafelV2.correctProblems }}/{{ gameStats.tafelV2.totalProblems }}</p>
          <p>Punten verdiend: {{ gameStats.tafelV2.totalPoints }}</p>
          <p>Beste streak: {{ gameStats.tafelV2.streakRecord }}</p>
          <p v-if="gameStats.tafelV2.totalProblems > 0">
            Accuratie: {{ Math.round((gameStats.tafelV2.correctProblems / gameStats.tafelV2.totalProblems) * 100) }}%
          </p>
        </div>
      </div>
    </div>

    <!-- Pokeball Shop -->
    <div class="flex flex-wrap justify-center gap-8">
      <div
        v-for="pokeballType in Object.values(PokeballType)"
        :key="pokeballType"
        class="bg-white p-4 rounded-xl shadow-md text-center w-[200px] transition-transform hover:scale-105"
      >
        <div class="w-20 h-20 mx-auto mb-4">
          <img
            :src="getImgUrl(pokeballType)"
            :alt="pokeballType"
            class="max-w-full max-h-full"
          />
        </div>

        <h2 class="text-lg font-semibold mb-2">{{ pokeballType }}</h2>

        <!-- Pokeball details -->
        <div class="text-xs text-gray-600 mb-3">
          <div>{{ getPokemonChances(pokeballType) }}</div>
        </div>

        <p class="mb-4 font-semibold">
          Voorraad: {{ pokemonStore.state.pokeballs[pokeballType] }}
        </p>

        <!-- Open button -->
        <button
          @click="() => openPokeball(pokeballType)"
          :disabled="pokemonStore.state.pokeballs[pokeballType] === 0"
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span v-if="pokemonStore.state.pokeballs[pokeballType] > 0">
            🎁 Open {{ pokeballType }}
          </span>
          <span v-else>Geen voorraad</span>
        </button>

        <!-- Buy button -->
        <button
          :disabled="!canBuy(pokeballType)"
          @click="buyPokeball(pokeballType)"
          :class="[
            'w-full px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
            canBuy(pokeballType)
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              : 'bg-gray-400 cursor-not-allowed'
          ]"
        >
          💰 {{ getPrice(pokeballType) }} punten
        </button>
      </div>
    </div>

    <!-- Obtained Pokemon Collection Info -->
    <div class="mt-8 bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">🐾 Pokemon Collectie</h3>
        <router-link
          to="/inventory"
          class="text-blue-600 hover:text-blue-800 underline"
        >
          Bekijk collectie ({{ pokemonStore.state.obtainedPokemons.length }})
        </router-link>
      </div>

      <!-- Recent pokemon (last 5) -->
      <div v-if="recentPokemon.length > 0" class="mt-3">
        <p class="text-sm text-gray-600 mb-2">Recent verkregen:</p>
        <div class="flex space-x-2">
          <img
            v-for="pokemon in recentPokemon"
            :key="pokemon.id"
            :src="pokemon.sprite"
            :alt="pokemon.name"
            :title="pokemon.name"
            class="w-12 h-12 rounded border-2 border-gray-200"
          />
        </div>
      </div>
    </div>

    <!-- Pokemon Opening Modal -->
    <div
      v-if="obtainedPokemon"
      class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      @click="closeOverlay"
    >
      <div
        class="relative bg-white p-8 rounded-xl shadow-xl text-center w-[350px] max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-2xl font-bold mb-2 capitalize">{{ obtainedPokemon.name }}</h3>
        <p class="text-sm text-gray-600 mb-4">Pokemon #{{ obtainedPokemon.id }}</p>

        <img
          :src="obtainedPokemon.sprite"
          :alt="obtainedPokemon.name"
          class="w-[150px] h-[150px] mx-auto mb-6 image-rendering: pixelated;"
        />

        <!-- Play cry button -->
        <button
          v-if="obtainedPokemon.cry"
          @click="playCry"
          class="mb-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
        >
          🔊 Geluid afspelen
        </button>

        <button
          @click="closeOverlay"
          class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Geweldig!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useSharedPokemonStore, PokeballType, pokeballChances, pokeballPrices, GameType, type Pokemon } from "../stores/sharedPokemonStore";

const pokemonStore = useSharedPokemonStore();
const obtainedPokemon = ref<Pokemon | null>(null);
const cryAudio = ref<HTMLAudioElement | null>(null);

onMounted(async () => {
  await pokemonStore.init();
});

// Computed properties
const gameStats = computed(() => ({
  woordrazernij: pokemonStore.state.gameStats[GameType.WOORD_RAZERNIJ],
  tafelV2: pokemonStore.state.gameStats[GameType.TAFEL_RAZERNIJ_V2]
}));

const recentPokemon = computed(() => {
  return pokemonStore.state.obtainedPokemons.slice(-5).reverse();
});

// Helper functions
const getImgUrl = (pokeballType: string) => `/assets/${pokeballType.toLowerCase()}.png`;

const getPrice = (pokeballType: PokeballType) => pokeballPrices[pokeballType];

const getPokemonChances = (pokeballType: PokeballType) => {
  const chances = pokeballChances[pokeballType];
  const parts = [];
  if (chances.common > 0) parts.push(`${chances.common}% gewoon`);
  if (chances.uncommon > 0) parts.push(`${chances.uncommon}% zeldzaam`);
  if (chances.rare > 0) parts.push(`${chances.rare}% epic`);
  if (chances.legendary > 0) parts.push(`${chances.legendary}% legendary`);
  return parts.join(', ');
};

const canBuy = (pokeballType: PokeballType) => {
  return pokemonStore.state.points >= getPrice(pokeballType);
};

// Actions
const buyPokeball = (pokeballType: PokeballType) => {
  if (canBuy(pokeballType)) {
    const success = pokemonStore.buyPokeball(pokeballType);
    if (!success) {
      console.error('Failed to buy pokeball - insufficient points');
    }
  }
};

const openPokeball = (pokeballType: PokeballType) => {
  if (pokemonStore.state.pokeballs[pokeballType] > 0) {
    const pokemon = pokemonStore.openPokeball(pokeballType);
    if (pokemon) {
      obtainedPokemon.value = pokemon;

      // Preload cry audio
      if (pokemon.cry) {
        cryAudio.value = new Audio(pokemon.cry);
        cryAudio.value.load();
      }
    }
  }
};

const closeOverlay = () => {
  obtainedPokemon.value = null;
  cryAudio.value = null;
};

const playCry = () => {
  if (cryAudio.value) {
    cryAudio.value.currentTime = 0;
    cryAudio.value.play().catch(error => {
      console.warn('Could not play pokemon cry:', error);
    });
  }
};

// Watch for new pokemon being obtained
watch(
  () => pokemonStore.state.obtainedPokemons,
  (newPokemons, oldPokemons) => {
    if (newPokemons.length > (oldPokemons?.length || 0)) {
      // Only show overlay if it was obtained via shop (not direct catch)
      // We can check if we're in shop context and show accordingly
    }
  },
  { deep: true }
);
</script>

<style scoped>
/* Pixelated pokemon sprites */
img[alt*="Pokemon"], img[alt*="pokemon"] {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>
