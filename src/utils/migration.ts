// Migration utility to transfer data from old stores to shared store
import { useSharedPokemonStore, type Pokemon } from "../stores/sharedPokemonStore";

export async function migrateToSharedStore() {
  const sharedStore = useSharedPokemonStore();
  let migrated = false;

  try {
    // Initialize shared store first
    await sharedStore.init();

    // Check if migration has already been done
    const migrationFlag = localStorage.getItem("typegame-migration-completed");
    if (migrationFlag === "true") {
      console.log("Migration already completed");
      return;
    }

    console.log("Starting migration to shared store...");

    // Migrate from woord razernij store (key: 'xxxx')
    const oldWoordData = localStorage.getItem("xxxx");
    if (oldWoordData) {
      try {
        const parsed = JSON.parse(oldWoordData);
        console.log("Migrating woord razernij data:", parsed);

        // Migrate points
        if (parsed.points && parsed.points > sharedStore.state.points) {
          sharedStore.state.points = parsed.points;
          migrated = true;
        }

        // Migrate pokeballs
        if (parsed.pokeballs) {
          Object.keys(parsed.pokeballs).forEach((type) => {
            if (parsed.pokeballs[type] > sharedStore.state.pokeballs[type]) {
              sharedStore.state.pokeballs[type] = parsed.pokeballs[type];
              migrated = true;
            }
          });
        }

        // Migrate obtained pokemon
        if (parsed.obtainedPokemons && Array.isArray(parsed.obtainedPokemons)) {
          // Add pokemon that aren't already in the shared store
          parsed.obtainedPokemons.forEach((pokemon: Pokemon) => {
            const exists = sharedStore.state.obtainedPokemons.some(
              (p) => p.id === pokemon.id && p.name === pokemon.name,
            );
            if (!exists) {
              sharedStore.state.obtainedPokemons.push(pokemon);
              migrated = true;
            }
          });
        }

        console.log("Woord razernij migration completed");
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
          // Add pokemon that aren't already in the shared store
          parsed.forEach((pokemon: Pokemon) => {
            // Add cry if not present
            if (!pokemon.cry) {
              pokemon.cry = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
            }

            const exists = sharedStore.state.obtainedPokemons.some(
              (p) => p.id === pokemon.id && p.name === pokemon.name,
            );
            if (!exists) {
              sharedStore.state.obtainedPokemons.push(pokemon);
              migrated = true;
            }
          });
        }

        console.log("Tafel razernij migration completed");
      } catch (error) {
        console.error("Error migrating tafel razernij data:", error);
      }
    }

    // Migrate analytics if exists
    const oldAnalytics = localStorage.getItem("typegame-parent-analytics");
    if (oldAnalytics) {
      try {
        JSON.parse(oldAnalytics);
        console.log("Analytics data found, keeping separate for now");
        // Analytics data is kept separate as it's managed by parentAnalytics
      } catch (error) {
        console.error("Error processing analytics data:", error);
      }
    }

    if (migrated) {
      console.log("Migration completed successfully! Marking as done.");
      localStorage.setItem("typegame-migration-completed", "true");

      // Optional: Backup old data before clearing (for safety)
      const backupData = {
        woordRazernij: localStorage.getItem("xxxx"),
        tafelRazernij: localStorage.getItem("pokemon-collection"),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("typegame-backup", JSON.stringify(backupData));

      // Don't remove old data immediately - let users verify everything works first
      console.log(
        "Old data preserved as backup. Remove manually after verification.",
      );
    } else {
      console.log("No data found to migrate or migration not needed");
      localStorage.setItem("typegame-migration-completed", "true");
    }
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

// Force re-migration (for development/testing)
export function forceMigration() {
  localStorage.removeItem("typegame-migration-completed");
  migrateToSharedStore();
}

// Clean up old data (call manually after verifying migration worked)
export function cleanupOldData() {
  const confirmation = confirm(
    "Are you sure you want to clean up old Pokemon data? " +
      "This will remove the old woord razernij and tafel razernij stores. " +
      "Make sure the new shared system is working correctly first!",
  );

  if (confirmation) {
    localStorage.removeItem("xxxx"); // Old woord razernij store
    localStorage.removeItem("pokemon-collection"); // Old tafel razernij store
    console.log("Old data cleaned up successfully");
  }
}
