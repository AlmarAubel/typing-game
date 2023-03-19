import { gql, request } from "graphql-request";
import pokemonsRaw from "../assets/pokemons.json";
import { RarityLevel } from "./pokemonUtils";
export interface RarityLevelRange {
  name: RarityLevel;
  range: [number, number];
}

export interface Pokemon {
  id: number;
  name: string;
  imgUrl: string;
  rarity?: RarityLevel;
}

const query = gql`
  query {
    pokemon_v2_pokemon {
      id
      name
      pokemon_v2_pokemonspecy {
        capture_rate
      }
    }
  }
`;

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
  const pokemons: {
    id: number;
    name: string;
    pokemon_v2_pokemonspecy: { capture_rate: number };
    pokemon_v2_pokemonsprites: any;
  }[] = //pokemonsRaw;
    await request("https://beta.pokeapi.co/graphql/v1beta", query).then(
      (data: any) => data.pokemon_v2_pokemon
    );
  console.log(JSON.stringify(pokemons));
  const categorizedPokemons: Pokemon[] = pokemons.map((p) => ({
    id: p.id,
    name: p.name,
    imgUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
    rarity: determineRarity(p.pokemon_v2_pokemonspecy.capture_rate),
  }));

  const pokemonsGroupedByRarity = groupPokemonsByRarity(categorizedPokemons);
  return pokemonsGroupedByRarity;
}
