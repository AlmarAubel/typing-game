<template>
  <div>
    <h1>Obtained Pokemons</h1>
    <div class="pokemon-grid">
      <div
        v-for="pokemon in store.state.obtainedPokemons"
        :key="pokemon.id"
        class="pokemon-card"
      >
        <h2>{{ pokemon.name }}</h2>
        <img :src="pokemon.imgUrl" :alt="pokemon.name" />
        <span class="tag" :class="rarityColors[pokemon.rarity]">
          {{ pokemon.rarity }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePokemonStore } from "../store/pokemonStore";
import { RarityLevel } from "../utils/pokemonUtils";
const store = usePokemonStore();

const rarityColors: Record<RarityLevel, string> = {
  common: "is-primary",
  uncommon: "is-warning",
  rare: "is-danger",
  legendary: "is-black",
};
</script>

<style scoped>
.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 1rem;
  padding: 1rem;
}

.pokemon-card {
  background-color: #f8f8f8;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pokemon-types span {
  display: inline-block;
  background-color: #efefef;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin: 0 0.25rem;
  font-size: 0.8rem;
}
</style>
