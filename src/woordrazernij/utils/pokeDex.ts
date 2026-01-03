import pokemonsRaw from "../assets/pokemons.json";
import { type RarityLevel } from "./pokemonUtils";
import type { Pokemon } from "../../stores/sharedPokemonStore";

export type { Pokemon };

export interface RarityLevelRange {
  name: RarityLevel;
  range: [number, number];
}

const rarityLevels: RarityLevelRange[] = [
  { name: "common", range: [200, 255] },
  { name: "uncommon", range: [100, 199] },
  { name: "rare", range: [50, 99] },
  { name: "legendary", range: [0, 49] },
];

function determineRarity(captureRate: number): RarityLevel {
  for (const rarity of rarityLevels) {
    const [min, max] = rarity.range;
    if (captureRate >= min && captureRate <= max) {
      return rarity.name;
    }
  }
  return "common";
}

function groupPokemonsByRarity(pokemons: Pokemon[]): {
  [key: string]: Pokemon[];
} {
  const groupedPokemons: Record<RarityLevel, Pokemon[]> = {
    common: [],
    uncommon: [],
    rare: [],
    legendary: [],
  };

  pokemons.forEach((pokemon) => {
    const rarity = pokemon.rarity;
    if (!groupedPokemons[rarity!]) {
      groupedPokemons[rarity!] = [];
    }
    groupedPokemons[rarity!].push(pokemon);
  });

  return groupedPokemons;
}
export async function getPokemon() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const pokemons: {
    id: number;
    name: string;
    pokemon_v2_pokemonspecy: { capture_rate: number };
    pokemon_v2_pokemonsprites: any;
  }[] = pokemonsRaw;
  // await request("https://beta.pokeapi.co/graphql/v1beta", query).then(
  //   (data: any) => data.pokemon_v2_pokemon
  // );
  console.log(JSON.stringify(pokemons));
  const categorizedPokemons: Pokemon[] = pokemons.map((p) => ({
    id: p.id,
    name: p.name,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
    rarity: determineRarity(p.pokemon_v2_pokemonspecy.capture_rate),
  }));

  const pokemonsGroupedByRarity = groupPokemonsByRarity(categorizedPokemons);
  return pokemonsGroupedByRarity;
}
