import { defineStore } from "pinia";

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  cry?: string; // Optional omdat oude opgeslagen Pokemon dit niet hebben
}

export const usePokemonStore = defineStore("pokemon", {
  state: () => ({
    collection: JSON.parse(localStorage.getItem("pokemon-collection") || "[]") as Pokemon[],
  }),

  actions: {
    async catchPokemon(pokemon: Pokemon) {
      // Voeg cry toe als die nog niet bestaat
      if (!pokemon.cry) {
        pokemon.cry = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
      }
      this.collection.push(pokemon);
      this.saveToStorage();
    },

    async catchRandomPokemon() {
      try {
        const id = Math.floor(Math.random() * 151) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();

        const pokemon = {
          id: data.id,
          name: data.name,
          sprite: data.sprites.front_default,
          cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`,
        };

        this.collection.push(pokemon);
        this.saveToStorage();
      } catch (error) {
        console.error("Error catching Pokemon:", error);
      }
    },

    saveToStorage() {
      localStorage.setItem("pokemon-collection", JSON.stringify(this.collection));
    },
  },
});
