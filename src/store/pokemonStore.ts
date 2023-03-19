import { defineStore } from "pinia";
import {
  PokeballType,
  PokeballChance,
  pokeballChances,
  getRandomRarity,
  getRandomPokemonByRarity,
} from "../utils/pokemonUtils";
import { Pokemon, getPokemon } from "../utils/pokeDex";

interface PokemonState {
  pokemons: { [key: string]: Pokemon[] };
  pokeballs: { [key: string]: number };
  obtainedPokemons: Pokemon[];
  points: number;
}

export const usePokemonStore = defineStore({
  id: "pokemon",
  state: (): PokemonState => ({
    pokemons: {}, // You'll need to fetch and process the data from the PokeAPI, then set it here
    pokeballs: {
      [PokeballType.POKEBALL]: 0,
      [PokeballType.GREATBALL]: 0,
      [PokeballType.ULTRABALL]: 0,
      [PokeballType.MASTERBALL]: 0,
    },
    points: 11500,
    obtainedPokemons: [],
  }),
  actions: {
    async init() {
      this.pokemons = await getPokemon();
    },
    addPoints(points: number) {
      this.points += points;
    },
    setPokemons(pokemons: { [key: string]: Pokemon[] }) {
      this.pokemons = pokemons;
    },
    async obtainPokemon(pokemon: Pokemon) {
      this.obtainedPokemons.push(pokemon);
    },
    usePokeball(pokeballType: PokeballType) {
      if (this.pokeballs[pokeballType] > 0) {
        this.pokeballs[pokeballType]--;
      }
    },
    buyPokeball(pokeballType: PokeballType, price: number) {
      if (this.points >= price) {
        this.points -= price;
        this.pokeballs[pokeballType]++;
      }
    },
    openPokeball(pokeballType: PokeballType): void {
      if (this.pokeballs[pokeballType] > 0) {
        this.pokeballs[pokeballType]--;
        const pokeballChance: PokeballChance = pokeballChances[pokeballType];
        const rarity: string = getRandomRarity(pokeballChance);
        const pokemon: Pokemon = getRandomPokemonByRarity(
          this.pokemons,
          rarity
        );
        this.obtainPokemon(pokemon);
      }
    },
  },
});
