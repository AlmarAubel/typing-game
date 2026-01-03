import { type Pokemon } from "./pokeDex";

export enum PokeballType {
  POKEBALL = "Pokeball",
  GREATBALL = "Greatball",
  ULTRABALL = "Ultraball",
  MASTERBALL = "Masterball",
}

export interface PokeballChance {
  common: number;
  uncommon: number;
  rare: number;
  legendary: number;
}

export const pokeballChances: { [key in PokeballType]: PokeballChance } = {
  [PokeballType.POKEBALL]: { common: 70, uncommon: 20, rare: 10, legendary: 0 },
  [PokeballType.GREATBALL]: {
    common: 50,
    uncommon: 30,
    rare: 20,
    legendary: 0,
  },
  [PokeballType.ULTRABALL]: {
    common: 30,
    uncommon: 40,
    rare: 25,
    legendary: 5,
  },
  [PokeballType.MASTERBALL]: {
    common: 0,
    uncommon: 20,
    rare: 30,
    legendary: 50,
  },
};

export function getRandomPokemonByRarity(
  pokemons: { [key: string]: Pokemon[] },
  rarity: string,
): Pokemon {
  const pokemonArray = pokemons[rarity];
  return pokemonArray[Math.floor(Math.random() * pokemonArray.length)];
}

// export async function fetchPokemon(id: number) {
//   const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
//   const data = await response.json();
//   return data;
// }

export type RarityLevel = keyof PokeballChance;

export function getRandomRarity(pokeballChance: PokeballChance): RarityLevel {
  const rarityLevels: RarityLevel[] = [
    "common",
    "uncommon",
    "rare",
    "legendary",
  ];
  const totalChance = Object.values(pokeballChance).reduce((a, b) => a + b, 0);
  const randomValue = Math.random() * totalChance;
  let accumulatedChance = 0;

  for (const rarity of rarityLevels) {
    accumulatedChance += pokeballChance[rarity];
    if (randomValue <= accumulatedChance) {
      return rarity;
    }
  }

  return rarityLevels[rarityLevels.length - 1];
}
