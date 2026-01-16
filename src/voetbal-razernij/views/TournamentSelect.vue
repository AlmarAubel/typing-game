<template>
  <div class="tournament-select-screen">
    <!-- Hero Section -->
    <div class="text-center mb-8">
      <div class="animate-bounce mb-4">
        <span class="text-8xl">🏆</span>
      </div>
      <h2 class="text-4xl font-bold text-white mb-4">Champions League Modus</h2>
      <p class="text-xl mb-6" style="color: rgba(255, 255, 255, 0.9)">
        Selecteer 3 tot 5 tafels om tegelijk te oefenen in een uitdagend
        toernooi!
      </p>
    </div>

    <!-- Resume Tournament Banner -->
    <div
      v-if="tournamentStore.tournament && tournamentStore.tournament.isActive"
      class="mb-8 max-w-2xl mx-auto bg-green-900/80 backdrop-blur rounded-2xl p-6 border-2 border-green-400 shadow-2xl"
    >
      <div class="text-center mb-4">
        <h3 class="text-2xl font-bold text-white mb-2">Toernooi Hervatten?</h3>
        <p class="text-green-200">Je bent nog bezig met een toernooi.</p>
      </div>
      <div class="flex justify-center gap-4">
        <button
          @click="resumeTournament"
          class="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-8 rounded-full transition-all border-2 border-green-300 shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <span>▶️</span> Verder Spelen
        </button>
        <button
          @click="abandonTournament"
          class="bg-red-500/20 hover:bg-red-500/40 text-red-200 font-bold py-3 px-6 rounded-full transition-all border-2 border-red-500/50 cursor-pointer"
        >
          Stoppen
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center">
      <div class="animate-spin text-6xl">⚽</div>
      <p class="text-white mt-4">Laden van clubs...</p>
    </div>

    <div v-else>
      <!-- Instructions -->
      <div
        class="instructions-banner mb-6 max-w-2xl mx-auto bg-blue-900/40 backdrop-blur rounded-2xl p-4 border border-blue-400/30"
      >
        <p class="text-center text-white">
          ✨ Kies minimaal <strong>3 tafels</strong> en maximaal
          <strong>5 tafels</strong>. Vragen worden willekeurig gemengd uit de
          geselecteerde tafels.
        </p>
      </div>

      <!-- Selected Tables Display -->
      <div
        v-if="selectedTables.length > 0"
        class="selected-display mb-6 max-w-2xl mx-auto"
      >
        <div
          class="bg-yellow-500/20 backdrop-blur rounded-2xl p-4 border-2 border-yellow-400"
        >
          <h3 class="text-center text-xl font-bold text-yellow-300 mb-3">
            Geselecteerde Tafels ({{ selectedTables.length }}/5)
          </h3>
          <div class="flex justify-center gap-3 flex-wrap">
            <div
              v-for="table in selectedTables"
              :key="table"
              class="bg-white/20 px-4 py-2 rounded-full font-bold text-white flex items-center gap-2"
            >
              <span>Tafel {{ table }}</span>
              <button
                @click="removeTable(table)"
                class="text-red-400 hover:text-red-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Grid -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto mb-8">
        <div
          v-for="table in tables"
          :key="table.number"
          class="table-card cursor-pointer"
          :class="{
            'ring-4 ring-yellow-400 scale-105 bg-white/30':
              selectedTables.includes(table.number),
            'opacity-50 cursor-not-allowed':
              !selectedTables.includes(table.number) &&
              selectedTables.length >= 5,
          }"
          @click="toggleTable(table.number)"
          :style="{ '--club-color': table.club?.primaryColor || '#1976D2' }"
        >
          <!-- Selected Checkmark -->
          <div
            v-if="selectedTables.includes(table.number)"
            class="absolute top-2 right-2 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <span class="text-black font-bold">✓</span>
          </div>

          <!-- Table Number -->
          <div class="table-number">
            <span class="text-4xl font-black">{{ table.number }}</span>
          </div>

          <!-- Club Info -->
          <div class="club-info">
            <div class="club-badge" v-if="table.club">
              <span class="text-2xl">🏆</span>
            </div>
            <div class="club-name">
              <span class="font-bold">{{
                table.club?.shortName || "ERE"
              }}</span>
            </div>
            <div class="club-full-name text-xs opacity-75 mt-1">
              {{ table.club?.name || "Eredivisie" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4 mb-8">
        <button
          @click="goBack"
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-all border-2 border-white/20"
        >
          ← Terug
        </button>

        <button
          @click="startTournament"
          :disabled="selectedTables.length < 3"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-all border-2 border-white/20 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
          :class="{ 'animate-pulse': selectedTables.length >= 3 }"
        >
          Start Toernooi ({{ selectedTables.length }}) ▶️
        </button>

        <button
          @click="router.push({ name: 'VoetbalChampionsStore' })"
          class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-full transition-all border-2 border-yellow-300 shadow-lg flex items-center gap-2"
        >
          <span>🛍️</span> Champions Store
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from "vue";
import { useRouter } from "vue-router";
import { useVoetbalGameStore, useTeamStore } from "../stores";
import { useTournamentStore } from "../stores/tournament";
import { FootballDataService } from "../utils/football-data";
import { TABLE_TO_CLUB_MAPPING } from "../utils/balance-config";

const router = useRouter();
const gameStore = useVoetbalGameStore();
const teamStore = useTeamStore();
const tournamentStore = useTournamentStore();

function resumeTournament() {
  router.push({ name: "VoetbalTournamentBracket" });
}

function abandonTournament() {
  if (
    confirm(
      "Weet je zeker dat je het huidige toernooi wilt stoppen? Alle voortgang gaat verloren.",
    )
  ) {
    tournamentStore.resetTournament();
  }
}

const isLoading = ref(true);
const isDataInitialized = inject("isDataInitialized", ref(false));
const selectedTables = ref<number[]>([]);

interface TableInfo {
  number: number;
  club?: {
    id: number;
    name: string;
    shortName: string;
    primaryColor: string;
  };
}

const tables = computed<TableInfo[]>(() => {
  if (!isDataInitialized.value) return [];

  const tableList: TableInfo[] = [];

  for (let i = 1; i <= 10; i++) {
    const clubId = TABLE_TO_CLUB_MAPPING[i];
    const club = clubId ? FootballDataService.getClubById(clubId) : undefined;

    tableList.push({
      number: i,
      club,
    });
  }

  return tableList;
});

function toggleTable(tableNumber: number) {
  const index = selectedTables.value.indexOf(tableNumber);

  if (index === -1) {
    // Add if not at max
    if (selectedTables.value.length < 5) {
      selectedTables.value.push(tableNumber);
    }
  } else {
    // Remove
    if (tournamentStore.tournament && tournamentStore.tournament.isActive) {
      if (
        !confirm(
          "Je hebt nog een lopend toernooi. Weet je zeker dat je een nieuw toernooi wilt starten? Je oude voortgang gaat verloren.",
        )
      ) {
        return;
      }
    }

    selectedTables.value.splice(index, 1);
  }
}

function removeTable(tableNumber: number) {
  const index = selectedTables.value.indexOf(tableNumber);
  if (index !== -1) {
    selectedTables.value.splice(index, 1);
  }
}

function startTournament() {
  if (selectedTables.value.length < 3) return;

  // Check if there's already an active session
  if (gameStore.isSessionActive) {
    if (
      confirm(
        "Er is al een actieve sessie. Wil je deze beëindigen en een nieuwe starten?",
      )
    ) {
      gameStore.endSession();
    } else {
      return;
    }
  }

  // Check if user has a team configured
  if (!teamStore.currentTeam) {
    alert(
      "Je hebt nog geen team samengesteld! Ga eerst naar Team Builder om een team te maken.",
    );
    router.push({ name: "VoetbalTeamBuilder" });
    return;
  }

  // Get player team info
  const playerTeamName = teamStore.currentTeam.name || "Mijn Team";
  // Use first player's club or default to Ajax (180)
  const firstPlayerSlot = teamStore.currentTeam.slots.find((s) => s.playerId);
  let playerClubId = 180; // Default: Ajax

  if (firstPlayerSlot && firstPlayerSlot.playerId) {
    const player = FootballDataService.getPlayerById(firstPlayerSlot.playerId);
    if (player) {
      playerClubId = player.clubId;
    }
  }

  // Start tournament with team info and navigate to bracket view
  tournamentStore.startTournament(
    selectedTables.value,
    playerTeamName,
    playerClubId,
  );
  router.push({
    name: "VoetbalTournamentBracket",
  });
}

function goBack() {
  router.push({ name: "VoetbalTableSelect" });
}

// Watch for data initialization from parent component
watch(
  isDataInitialized,
  (initialized) => {
    if (initialized) {
      isLoading.value = false;
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (isDataInitialized.value) {
    isLoading.value = false;
  }
});
</script>

<style scoped>
@reference "tailwindcss";

.tournament-select-screen {
  @apply min-h-screen p-6;
}

.table-card {
  @apply relative backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:scale-105;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--club-color, #1976d2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.table-card:hover:not(.opacity-50) {
  box-shadow: 0 12px 48px var(--club-color);
  transform: translateY(-8px) scale(1.05);
  background-color: rgba(255, 255, 255, 0.2);
}

.table-number {
  @apply text-center mb-3;
  color: var(--club-color);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.club-info {
  @apply text-center text-white;
}

.club-badge {
  @apply text-center mb-2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.club-name {
  @apply text-lg font-bold;
  color: var(--club-color);
}
</style>
