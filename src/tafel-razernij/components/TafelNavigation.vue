<template>
  <div class="flex items-center space-x-4">
    <NavLink :to="{ name: 'tafel-home' }">🎲 Kies Tafel</NavLink>
    <NavLink :to="{ name: 'tafel-inventory' }">🐾 Mijn Pokemons</NavLink>
  </div>
</template>

<script setup lang="ts">
import NavLink from "../../components/NavLink.vue";
</script>


