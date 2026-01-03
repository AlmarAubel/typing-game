import { useSharedPokemonStore } from "../stores/sharedPokemonStore";

/**
 * Migrates data from old pokemon stores to the new shared store
 */
export function migrateToSharedStore() {
  const sharedStore = useSharedPokemonStore();

  try {
    // Check if migration has already been performed
    const migrationKey = "typegame-migration-completed";
    const migrationCompleted = localStorage.getItem(migrationKey);

    if (migrationCompleted) {
      console.log("Migration already completed, skipping...");
      return;
    }

    console.log("Starting migration to shared pokemon store...");

    let migrationPerformed = false;

    // Migrate from woord razernij store (key: 'xxxx')
    const oldWoordData = localStorage.getItem("xxxx");
    if (oldWoordData) {
      try {
        const parsed = JSON.parse(oldWoordData);
        console.log("Migrating woord razernij data:", parsed);

        if (parsed.points && parsed.points > 0) {
          sharedStore.state.points += parsed.points;
          migrationPerformed = true;
        }

        if (parsed.pokeballs) {
          Object.keys(parsed.pokeballs).forEach((pokeballType) => {
            if (sharedStore.state.pokeballs[pokeballType] !== undefined) {
              sharedStore.state.pokeballs[pokeballType] +=
                parsed.pokeballs[pokeballType];
            }
          });
          migrationPerformed = true;
        }

        if (parsed.obtainedPokemons && Array.isArray(parsed.obtainedPokemons)) {
          parsed.obtainedPokemons.forEach((pokemon: any) => {
            // Add cry if not present
            if (!pokemon.cry && pokemon.id) {
              pokemon.cry = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
            }
            sharedStore.state.obtainedPokemons.push(pokemon);
          });
          migrationPerformed = true;
        }
      } catch (error) {
        console.error("Error migrating woord razernij data:", error);
      }
    }

    // Migrate from tafel razernij store (key: 'pokemon-collection')
    const oldTafelData = localStorage.getItem("pokemon-collection");
    if (oldTafelData) {
      try {
        const parsed = JSON.parse(oldTafelData);
        console.log("Migrating tafel razernij data:", parsed);

        if (Array.isArray(parsed)) {
          parsed.forEach((pokemon: any) => {
            // Add cry if not present
            if (!pokemon.cry && pokemon.id) {
              pokemon.cry = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
            }

            // Avoid duplicates based on id and name
            const exists = sharedStore.state.obtainedPokemons.some(
              (p) => p.id === pokemon.id && p.name === pokemon.name,
            );

            if (!exists) {
              sharedStore.state.obtainedPokemons.push(pokemon);
            }
          });
          migrationPerformed = true;
        }
      } catch (error) {
        console.error("Error migrating tafel razernij data:", error);
      }
    }

    if (migrationPerformed) {
      console.log("Migration completed successfully");
      console.log("Final shared store state:", sharedStore.state);

      // Mark migration as completed
      localStorage.setItem(migrationKey, "true");

      // Optionally backup old data before clearing
      const backupData = {
        woordRazernij: oldWoordData,
        tafelRazernij: oldTafelData,
        migrationDate: new Date().toISOString(),
      };
      localStorage.setItem(
        "typegame-migration-backup",
        JSON.stringify(backupData),
      );

      console.log("Migration backup created");
    } else {
      console.log("No data found to migrate");
      // Still mark migration as completed to avoid future checks
      localStorage.setItem(migrationKey, "true");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

/**
 * Resets migration status (for testing purposes)
 */
export function resetMigration() {
  localStorage.removeItem("typegame-migration-completed");
  console.log("Migration status reset");
}

/**
 * Checks if migration has been completed
 */
export function isMigrationCompleted(): boolean {
  return localStorage.getItem("typegame-migration-completed") === "true";
}

/**
 * Restores data from migration backup
 */
export function restoreFromBackup() {
  const backup = localStorage.getItem("typegame-migration-backup");
  if (backup) {
    try {
      const backupData = JSON.parse(backup);

      if (backupData.woordRazernij) {
        localStorage.setItem("xxxx", backupData.woordRazernij);
      }

      if (backupData.tafelRazernij) {
        localStorage.setItem("pokemon-collection", backupData.tafelRazernij);
      }

      // Reset migration status
      resetMigration();

      console.log("Backup restored successfully");
      return true;
    } catch (error) {
      console.error("Error restoring backup:", error);
      return false;
    }
  } else {
    console.log("No backup found to restore");
    return false;
  }
}
