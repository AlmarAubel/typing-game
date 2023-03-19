<template>
  <div class="navbar">
    <div class="navbar-menu">
      <div class="navbar-item" @click="goToPokeballShop">
        <!-- <img src="/assets/pokeball-shop.png" alt="Pokeball Shop" /> -->

        <span> 🏪 Pokeball Shop</span>
      </div>
      <div class="navbar-item" @click="goToMyPokemons">
        <!-- <img src="/assets/my-pokemons.png" alt="My Pokemons" /> -->
        <span>🐾 My Pokemons</span>
      </div>
      <div class="navbar-item" @click="goToGame">
        <span>🎮 Game</span>
      </div>
    </div>
  </div>
  <div class="pokemon-app">
    <pokemon v-if="activeScreen === Navigation.pokeballshop"></pokemon>
    <game-screen v-if="activeScreen === Navigation.game" />
    <obtained-pokemons v-if="activeScreen === Navigation.pokemoninventory" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

import gameScreen from "./components/gameScreen.vue";
import pokemon from "./components/pokemon.vue";
import ObtainedPokemons from "./components/ObtainedPokemons.vue";
enum Navigation {
  game,
  pokeballshop,
  pokemoninventory,
}

const activeScreen = ref<Navigation>(Navigation.game);

const goToPokeballShop = () => {
  // Navigeer naar de Pokeball Shop pagina
  activeScreen.value = Navigation.pokeballshop;
};

const goToMyPokemons = () => {
  // Navigeer naar de My Pokemons pagina
  activeScreen.value = Navigation.pokemoninventory;
};

const goToGame = () => {
  // Navigeer naar het Game pagina
  activeScreen.value = Navigation.game;
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}
</style>
