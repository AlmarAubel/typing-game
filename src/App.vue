<template>
  <div class="navbar is-fixed-top">
    <div class="navbar-menu">
      <router-link class="navbar-item" role="button" to="/shop">
        <span> 🏪 Pokeball Shop</span>
      </router-link>
      <router-link class="navbar-item" role="button" to="/inventory">
        <span>🐾 My Pokemons</span>
      </router-link>
      <router-link class="navbar-item" role="button" to="/game">
        <span>🎮 Game</span>
      </router-link>
    </div>
  </div>

  <div class="section">
    <div class="pokemon-app container">
      <router-view></router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

enum Navigation {
  game,
  pokeballshop,
  pokemoninventory,
}

const activeScreen = ref<Navigation>(Navigation.game);
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
/* body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
} */
</style>
