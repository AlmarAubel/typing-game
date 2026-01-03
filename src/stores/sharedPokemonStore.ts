import { defineStore } from "pinia";
import { reactive } from "vue";

// Pokemon interface - compatible with both existing systems
export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  imageUrl?: string;
  cry?: string;
  rarity?: "common" | "uncommon" | "rare" | "legendary";
}

// Pokeball types and chances from woord razernij
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

export const pokeballPrices = {
  [PokeballType.POKEBALL]: 10,
  [PokeballType.GREATBALL]: 30,
  [PokeballType.ULTRABALL]: 50,
  [PokeballType.MASTERBALL]: 100,
};

// Game types for analytics
export enum GameType {
  WOORD_RAZERNIJ = "woordrazernij",

  TAFEL_RAZERNIJ_V2 = "tafelrazernij-v2",
}

interface SharedPokemonState {
  // Pokemon collection and database
  pokemons: { [key: string]: Pokemon[] };
  obtainedPokemons: Pokemon[];

  // Economy system
  points: number;
  pokeballs: { [key: string]: number };

  // Game statistics
  gameStats: {
    [GameType.WOORD_RAZERNIJ]: {
      totalWords: number;
      correctWords: number;
      totalPoints: number;
    };
    [GameType.TAFEL_RAZERNIJ_V2]: {
      totalProblems: number;
      correctProblems: number;
      totalPoints: number;
      streakRecord: number;
      currentStreak: number;
    };
  };
}

export const useSharedPokemonStore = defineStore(
  "sharedPokemon",
  () => {
    const state = reactive<SharedPokemonState>({
      pokemons: {},
      obtainedPokemons: [],
      points: 0,
      pokeballs: {
        [PokeballType.POKEBALL]: 0,
        [PokeballType.GREATBALL]: 0,
        [PokeballType.ULTRABALL]: 0,
        [PokeballType.MASTERBALL]: 0,
      },
      gameStats: {
        [GameType.WOORD_RAZERNIJ]: {
          totalWords: 0,
          correctWords: 0,
          totalPoints: 0,
        },
        [GameType.TAFEL_RAZERNIJ_V2]: {
          totalProblems: 0,
          correctProblems: 0,
          totalPoints: 0,
          streakRecord: 0,
          currentStreak: 0,
        },
      },
    });

    // Initialize pokemon database
    async function init() {
      try {
        // Use existing pokemon data if available
        const response = await fetch("/src/woordrazernij/assets/pokemons.json");
        if (response.ok) {
          // Process the raw data to get properly categorized pokemon
          const { getPokemon } = await import("../woordrazernij/utils/pokeDex");
          state.pokemons = await getPokemon();
          console.log("Loaded pokemon data:", state.pokemons);
        } else {
          // Fallback to loading from file system
          const { getPokemon } = await import("../woordrazernij/utils/pokeDex");
          state.pokemons = await getPokemon();
          console.log("Fallback loaded pokemon data:", state.pokemons);
        }

        // Ensure we have some pokemon data
        if (!state.pokemons || Object.keys(state.pokemons).length === 0) {
          console.warn("No pokemon data loaded, creating fallback");
          state.pokemons = {
            common: [
              {
                id: 1,
                name: "bulbasaur",
                sprite:
                  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
                rarity: "common",
              },
              {
                id: 4,
                name: "charmander",
                sprite:
                  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
                rarity: "common",
              },
              {
                id: 7,
                name: "squirtle",
                sprite:
                  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
                rarity: "common",
              },
            ],
            uncommon: [
              {
                id: 25,
                name: "pikachu",
                sprite:
                  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
                rarity: "uncommon",
              },
            ],
            rare: [
              {
                id: 6,
                name: "charizard",
                sprite:
                  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
                rarity: "rare",
              },
            ],
            legendary: [
              {
                id: 150,
                name: "mewtwo",
                sprite:
                  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
                rarity: "legendary",
              },
            ],
          };
        }
      } catch (error) {
        console.error("Error loading pokemon data:", error);
        // Create minimal fallback data
        state.pokemons = {
          common: [
            {
              id: 1,
              name: "bulbasaur",
              sprite:
                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
              rarity: "common",
            },
          ],
          uncommon: [],
          rare: [],
          legendary: [],
        };
      }
    }

    // Points management
    function addPoints(points: number, gameType: GameType) {
      state.points += points;
      state.gameStats[gameType].totalPoints += points;
    }

    // Pokeball management
    function buyPokeball(pokeballType: PokeballType): boolean {
      const price = pokeballPrices[pokeballType];
      if (state.points >= price) {
        state.points -= price;
        state.pokeballs[pokeballType]++;
        return true;
      }
      return false;
    }

    function openPokeball(pokeballType: PokeballType): Pokemon | null {
      if (state.pokeballs[pokeballType] <= 0) {
        return null;
      }

      state.pokeballs[pokeballType]--;
      const pokeballChance: PokeballChance = pokeballChances[pokeballType];
      const rarity = getRandomRarity(pokeballChance);
      const pokemon = getRandomPokemonByRarity(state.pokemons, rarity);

      if (pokemon) {
        obtainPokemon(pokemon);
        return pokemon;
      }

      return null;
    }

    // Pokemon collection
    function obtainPokemon(pokemon: Pokemon) {
      // Add sprite if not present
      if (!pokemon.sprite) {
        pokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
      }

      // Add cry if not present
      if (!pokemon.cry) {
        pokemon.cry = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
      }
      state.obtainedPokemons.push(pokemon);
    }

    // Game statistics
    function recordGameResult(
      gameType: GameType,
      correct: boolean,
      pointsEarned: number = 0,
    ) {
      const stats = state.gameStats[gameType];

      if (gameType === GameType.WOORD_RAZERNIJ) {
        const woordStats = stats as {
          totalWords: number;
          correctWords: number;
          totalPoints: number;
        };
        woordStats.totalWords++;
        if (correct) woordStats.correctWords++;
      } else if (gameType === GameType.TAFEL_RAZERNIJ_V2) {
        const tafelStats = stats as {
          totalProblems: number;
          correctProblems: number;
          totalPoints: number;
          streakRecord: number;
          currentStreak: number;
        };
        tafelStats.totalProblems++;
        if (correct) {
          tafelStats.correctProblems++;
          tafelStats.currentStreak++;
          tafelStats.streakRecord = Math.max(
            tafelStats.streakRecord,
            tafelStats.currentStreak,
          );
        } else {
          tafelStats.currentStreak = 0;
        }
      }

      if (pointsEarned > 0) {
        addPoints(pointsEarned, gameType);
      }
    }

    // Reset current streak (for new game sessions)
    function resetStreak() {
      state.gameStats[GameType.TAFEL_RAZERNIJ_V2].currentStreak = 0;
    }

    // Helper functions
    function getRandomRarity(
      pokeballChance: PokeballChance,
    ): keyof PokeballChance {
      const rarityLevels: (keyof PokeballChance)[] = [
        "common",
        "uncommon",
        "rare",
        "legendary",
      ];
      const totalChance = Object.values(pokeballChance).reduce(
        (a, b) => a + b,
        0,
      );
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

    function getRandomPokemonByRarity(
      pokemons: { [key: string]: Pokemon[] },
      rarity: string,
    ): Pokemon {
      const pokemonArray = pokemons[rarity];
      if (!pokemonArray || pokemonArray.length === 0) {
        // Fallback to common if rarity not found
        return (
          pokemons["common"]?.[0] || {
            id: 1,
            name: "Bulbasaur",
            sprite:
              "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
            cry: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/1.ogg",
          }
        );
      }
      const selectedPokemon =
        pokemonArray[Math.floor(Math.random() * pokemonArray.length)];

      // Ensure sprite is set
      if (!selectedPokemon.sprite) {
        selectedPokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`;
      }

      return selectedPokemon;
    }

    // Migration helper for existing data
    function migrateFromOldStores() {
      // Migrate from woord razernij store
      const oldWoordData = localStorage.getItem("xxxx");
      if (oldWoordData) {
        try {
          const parsed = JSON.parse(oldWoordData);
          if (parsed.points) state.points = parsed.points;
          if (parsed.pokeballs)
            state.pokeballs = { ...state.pokeballs, ...parsed.pokeballs };
          if (parsed.obtainedPokemons)
            state.obtainedPokemons = parsed.obtainedPokemons;
        } catch (error) {
          console.error("Error migrating woord razernij data:", error);
        }
      }

      // Migrate from tafel razernij store
      const oldTafelData = localStorage.getItem("pokemon-collection");
      if (oldTafelData) {
        try {
          const parsed = JSON.parse(oldTafelData);
          if (Array.isArray(parsed)) {
            // Add migrated pokemon to collection
            state.obtainedPokemons = [...state.obtainedPokemons, ...parsed];
          }
        } catch (error) {
          console.error("Error migrating tafel razernij data:", error);
        }
      }
    }

    return {
      state,
      init,
      addPoints,
      buyPokeball,
      openPokeball,
      obtainPokemon,
      recordGameResult,
      resetStreak,
      migrateFromOldStores,
    };
  },
  {
    persist: {
      key: "typegame-shared-pokemon",
      storage: localStorage,
    },
  },
);
