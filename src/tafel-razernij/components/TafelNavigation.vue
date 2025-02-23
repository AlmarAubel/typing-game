<template>
  <div class="flex items-center space-x-4">
    <router-link class="nav-link" :to="{ name: 'tafel-home' }">🎲 Kies Tafel</router-link>
    <router-link class="nav-link" :to="{ name: 'tafel-inventory' }">🐾 Mijn Pokemons</router-link>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.nav-link {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.nav-link:hover {
  background-color: rgba(55, 65, 81, 1);
}
</style>
