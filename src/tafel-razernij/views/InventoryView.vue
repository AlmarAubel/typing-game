<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Mijn Pokemons</h1>
    <div class="grid grid-cols-1">
      <pokemon-sidebar :columns="4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PokemonSidebar from "../components/PokemonSidebar.vue";
</script>
