import { ref } from "vue";

type GameStateMessageType = "success" | "error";

type Matcher = (key: string) => boolean;

type Snapshot = Record<string, string>;

export interface UseGameStateBackupOptions {
  additionalKeys?: string[];
  additionalMatchers?: Matcher[];
  onImportSuccess?: (snapshot: Snapshot) => void;
}

export interface GameStateMessage {
  type: GameStateMessageType;
  text: string;
}

const DEFAULT_KEYS = [
  "typegame-parent-analytics",
  "typegame-shared-pokemon",
  "voetbal-game",
  "voetbal-club-progress",
  "voetbal-collection",
  "pokemon-collection",
  "xxxx",
  "typegame-migration-completed",
  "typegame-backup",
  "typegame-migration-backup",
  "pokemon-sound-enabled",
];

const DEFAULT_MATCHERS: Matcher[] = [
  (key) => key.startsWith("session-"),
  (key) => key.startsWith("typegame-"),
  (key) => key.startsWith("voetbal-"),
  (key) => key.startsWith("pokemon-"),
];

function mergeMatchers(base: Matcher[], extra: Matcher[]): Matcher[] {
  const set = new Set<Matcher>(base);
  extra.forEach((matcher) => set.add(matcher));
  return Array.from(set);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function useGameStateBackup(options: UseGameStateBackupOptions = {}) {
  const {
    additionalKeys = [],
    additionalMatchers = [],
    onImportSuccess,
  } = options;

  const keys = Array.from(new Set([...DEFAULT_KEYS, ...additionalKeys]));
  const matchers = mergeMatchers(DEFAULT_MATCHERS, additionalMatchers);

  const gameStateMessage = ref<GameStateMessage | null>(null);
  const isExporting = ref(false);
  const isImporting = ref(false);
  const importFileInput = ref<HTMLInputElement | null>(null);

  const recordKey = (
    snapshot: Snapshot,
    recorded: Set<string>,
    key: string,
  ) => {
    if (recorded.has(key)) return;
    const value = localStorage.getItem(key);
    if (value !== null) {
      snapshot[key] = value;
      recorded.add(key);
    }
  };

  const buildGameStateSnapshot = () => {
    const snapshot: Snapshot = {};
    const recordedKeys = new Set<string>();

    keys.forEach((key) => recordKey(snapshot, recordedKeys, key));

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (matchers.some((matcher) => matcher(key))) {
        recordKey(snapshot, recordedKeys, key);
      }
    }

    return snapshot;
  };

  const exportGameState = () => {
    if (isExporting.value) return;
    isExporting.value = true;
    gameStateMessage.value = null;

    try {
      const snapshot = buildGameStateSnapshot();
      const snapshotCount = Object.keys(snapshot).length;

      if (snapshotCount === 0) {
        gameStateMessage.value = {
          type: "error",
          text: "Er zijn momenteel geen opgeslagen gegevens om te exporteren.",
        };
        return;
      }

      const payload = {
        exportedAt: new Date().toISOString(),
        source: "typegame",
        data: snapshot,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `typegame-gamestate-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      link.click();
      URL.revokeObjectURL(url);

      gameStateMessage.value = {
        type: "success",
        text: `Game state geëxporteerd (${snapshotCount} items).`,
      };
    } catch (error) {
      gameStateMessage.value = {
        type: "error",
        text: `Export mislukt: ${error instanceof Error ? error.message : "Onbekende fout"}`,
      };
    } finally {
      isExporting.value = false;
    }
  };

  const triggerImport = () => {
    gameStateMessage.value = null;
    importFileInput.value?.click();
  };

  const normalizeImportedPayload = (payload: unknown): Snapshot => {
    if (!isRecord(payload)) {
      throw new Error("Bestand bevat geen bruikbare gegevens");
    }

    if (isRecord(payload.data)) {
      return payload.data as Snapshot;
    }

    return payload as Snapshot;
  };

  const handleImportFile = (event: Event) => {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;
    isImporting.value = true;
    gameStateMessage.value = null;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result;
        if (typeof text !== "string") {
          throw new Error("Bestand kon niet gelezen worden");
        }
        const parsed = JSON.parse(text);
        const snapshot = normalizeImportedPayload(parsed);
        const entries = Object.entries(snapshot).filter(
          ([, value]) => typeof value === "string",
        );

        entries.forEach(([key, value]) => {
          localStorage.setItem(key, value as string);
        });

        gameStateMessage.value = {
          type: "success",
          text: `Game state geïmporteerd (${entries.length} items). Herlaad de pagina om alle modules te synchroniseren.`,
        };

        onImportSuccess?.(snapshot);
      } catch (error) {
        gameStateMessage.value = {
          type: "error",
          text: `Import mislukt: ${error instanceof Error ? error.message : "Ongeldig JSON-bestand"}`,
        };
      } finally {
        isImporting.value = false;
        if (importFileInput.value) {
          importFileInput.value.value = "";
        }
      }
    };

    reader.onerror = () => {
      gameStateMessage.value = {
        type: "error",
        text: "Import mislukt tijdens het lezen van het bestand.",
      };
      isImporting.value = false;
      if (importFileInput.value) {
        importFileInput.value.value = "";
      }
    };

    reader.readAsText(file);
  };

  return {
    importFileInput,
    isExporting,
    isImporting,
    gameStateMessage,
    exportGameState,
    triggerImport,
    handleImportFile,
  };
}
