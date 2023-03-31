<template>
  <main-navigation />

  <div class="section">
    <div class="pokemon-app container">
      <router-view></router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import MainNavigation from "./MainNavigation.vue";

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
</style>
