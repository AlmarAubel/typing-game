<template>
  <div class="flex items-center space-x-4">
    <NavLink :to="{ name: 'woord-newgame' }">🎮 Nieuw spel</NavLink>
    <NavLink :to="{ name: 'shared-shop' }">🏪 Pokeball Shop</NavLink>
    <NavLink :to="{ name: 'woord-obtainedpokemons' }">🐾 Mijn Pokemons</NavLink>
  </div>
</template>

<script setup lang="ts">
import NavLink from "../../components/NavLink.vue";
</script>
