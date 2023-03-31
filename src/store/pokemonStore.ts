import { defineStore } from "pinia";
import { PokeballType, PokeballChance, pokeballChances, getRandomRarity, getRandomPokemonByRarity } from "../utils/pokemonUtils";
import { Pokemon, getPokemon } from "../utils/pokeDex";
import { reactive } from "vue";

interface PokemonState {
  pokemons: { [key: string]: Pokemon[] };
  pokeballs: { [key: string]: number };
  obtainedPokemons: Pokemon[];
  points: number;
}

export const usePokemonStore = defineStore(
  "pokemon",
  () => {
    const state = reactive<PokemonState>({
      pokemons: {},
      pokeballs: {
        [PokeballType.POKEBALL]: 0,
        [PokeballType.GREATBALL]: 0,
        [PokeballType.ULTRABALL]: 0,
        [PokeballType.MASTERBALL]: 0,
      },
      points: 0,
      obtainedPokemons: [],
    });

    async function init() {
      state.pokemons = await getPokemon();
    }

    function addPoints(points: number) {
      state.points += points;
    }

    function setPokemons(pokemons: { [key: string]: Pokemon[] }) {
      state.pokemons = pokemons;
    }

    function obtainPokemon(pokemon: Pokemon) {
      state.obtainedPokemons.push(pokemon);
    }

    function usePokeball(pokeballType: PokeballType) {
      if (state.pokeballs[pokeballType] > 0) {
        state.pokeballs[pokeballType]--;
      }
    }

    function buyPokeball(pokeballType: PokeballType, price: number) {
      if (state.points >= price) {
        state.points -= price;
        state.pokeballs[pokeballType]++;
      }
    }

    function openPokeball(pokeballType: PokeballType): void {
      if (state.pokeballs[pokeballType] > 0) {
        state.pokeballs[pokeballType]--;
        const pokeballChance: PokeballChance = pokeballChances[pokeballType];
        const rarity: string = getRandomRarity(pokeballChance);
        const pokemon: Pokemon = getRandomPokemonByRarity(state.pokemons, rarity);
        obtainPokemon(pokemon);
      }
    }

    return {
      state,
      init,
      openPokeball,
      buyPokeball,
      setPokemons,
      addPoints,
      usePokeball,
    };
  },
  {
    persist: { key: "xxxx" },
  }
);
