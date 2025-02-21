<script setup lang="ts">
import { usePokemonStore } from '../stores/pokemon' // Import the store

const pokemonStore = usePokemonStore() // Initialize the store
</script>

<template>
  <div class="pokemon-sidebar">
    <h3>Gevangen Pokemon ({{ pokemonStore.collection.length }})</h3>
    <div class="pokemon-collection">
      <div v-for="pokemon in pokemonStore.collection" :key="pokemon.id" class="pokemon">
        <div class="pokemon-image">
          <img :src="pokemon.sprite" :alt="pokemon.name">
          <span class="pokemon-name">{{ pokemon.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-sidebar {
  background: rgba(255,255,255,0.95);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow-y: auto;
  height: 100%;
  margin-bottom: 1rem;
}

.pokemon-collection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem;
  padding-bottom: 2rem; /* Add padding to the bottom */
}

.pokemon {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.pokemon:hover {
  transform: translateY(-2px);
}

.pokemon-image {
  position: relative;
  background: linear-gradient(to bottom, #f0f0f0, #ffffff);
  padding: 0.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.pokemon-image img {
  width: 100%;
  height: auto;
  display: block;
}

.pokemon-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 0.8rem;
  padding: 0.25rem;
  text-align: center;
  text-transform: capitalize;
}
</style>
