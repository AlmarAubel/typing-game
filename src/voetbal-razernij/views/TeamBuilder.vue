<template>
  <div class="team-builder">
    <!-- Loading State -->
    <div v-if="!isDataLoaded" class="loading-state">
      <div class="flex items-center justify-center min-h-64">
        <div class="text-center text-white">
          <div class="animate-spin text-6xl mb-4">⚽</div>
          <p class="text-xl">Voetbaldata wordt geladen...</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="initializationError" class="error-state">
      <div class="bg-red-500/20 border border-red-500 rounded-lg p-6 mx-4">
        <div class="text-center text-white">
          <div class="text-6xl mb-4">⚠️</div>
          <h2 class="text-2xl font-bold mb-2">Oops! Er ging iets mis</h2>
          <p class="mb-4">{{ initializationError }}</p>
          <button
            @click="retryInitialization"
            class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Opnieuw proberen
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header -->
      <div class="team-builder-header mb-8">
        <h1 class="text-4xl font-bold text-white text-center mb-4">
          ⚽ Team Samenstellen
        </h1>
        <div class="team-info">
          <input
            v-model="teamName"
            @blur="updateTeamName"
            class="team-name-input"
            placeholder="Team naam"
          />
          <div class="team-rating" v-if="teamStore.currentTeam">
            <span class="rating-label">Team Rating:</span>
            <span class="rating-value">{{
              teamStore.currentTeam.totalRating
            }}</span>
          </div>
        </div>
      </div>

      <!-- Formation Display -->
      <div class="formation-display mb-8">
        <div class="football-pitch">
          <!-- Attackers -->
          <div class="formation-line attackers">
            <div
              v-for="slot in attackerSlots"
              :key="slot.slotNumber"
              class="player-slot attacker"
              @click="selectSlot(slot)"
              :class="{
                filled: slot.playerId,
                selected: selectedSlot?.slotNumber === slot.slotNumber,
              }"
            >
              <div v-if="slot.playerId" class="slot-player">
                <div class="player-name">
                  {{ getPlayerName(slot.playerId) }}
                </div>
                <div class="player-rating">
                  {{ getPlayerRating(slot.playerId) }}
                </div>
              </div>
              <div v-else class="empty-slot">
                <span class="position-label">A</span>
              </div>
            </div>
          </div>

          <!-- Midfielders -->
          <div class="formation-line midfielders">
            <div
              v-for="slot in midfielderSlots"
              :key="slot.slotNumber"
              class="player-slot midfielder"
              @click="selectSlot(slot)"
              :class="{
                filled: slot.playerId,
                selected: selectedSlot?.slotNumber === slot.slotNumber,
              }"
            >
              <div v-if="slot.playerId" class="slot-player">
                <div class="player-name">
                  {{ getPlayerName(slot.playerId) }}
                </div>
                <div class="player-rating">
                  {{ getPlayerRating(slot.playerId) }}
                </div>
              </div>
              <div v-else class="empty-slot">
                <span class="position-label">M</span>
              </div>
            </div>
          </div>

          <!-- Defenders -->
          <div class="formation-line defenders">
            <div
              v-for="slot in defenderSlots"
              :key="slot.slotNumber"
              class="player-slot defender"
              @click="selectSlot(slot)"
              :class="{
                filled: slot.playerId,
                selected: selectedSlot?.slotNumber === slot.slotNumber,
              }"
            >
              <div v-if="slot.playerId" class="slot-player">
                <div class="player-name">
                  {{ getPlayerName(slot.playerId) }}
                </div>
                <div class="player-rating">
                  {{ getPlayerRating(slot.playerId) }}
                </div>
              </div>
              <div v-else class="empty-slot">
                <span class="position-label">V</span>
              </div>
            </div>
          </div>

          <!-- Goalkeeper -->
          <div class="formation-line goalkeeper">
            <div
              v-for="slot in keeperSlots"
              :key="slot.slotNumber"
              class="player-slot keeper"
              @click="selectSlot(slot)"
              :class="{
                filled: slot.playerId,
                selected: selectedSlot?.slotNumber === slot.slotNumber,
              }"
            >
              <div v-if="slot.playerId" class="slot-player">
                <div class="player-name">
                  {{ getPlayerName(slot.playerId) }}
                </div>
                <div class="player-rating">
                  {{ getPlayerRating(slot.playerId) }}
                </div>
              </div>
              <div v-else class="empty-slot">
                <span class="position-label">K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Player Selection Panel -->
      <div class="player-selection-panel" v-if="selectedSlot">
        <div class="panel-header">
          <h3 class="panel-title">
            Kies een {{ formatPosition(selectedSlot.position) }}
          </h3>
          <button
            @click="clearSlot"
            class="clear-btn"
            v-if="selectedSlot.playerId"
          >
            🗑️ Verwijderen
          </button>
        </div>

        <div class="available-players">
          <div
            v-if="availablePlayersForPosition.length === 0"
            class="no-players"
          >
            <span class="text-4xl">😔</span>
            <p>
              Je hebt nog geen
              {{ formatPosition(selectedSlot.position).toLowerCase() }}s
              verzameld.
            </p>
            <button @click="goToCollection" class="collect-btn">
              🎴 Ga Spelers Verzamelen
            </button>
          </div>

          <div
            v-for="player in availablePlayersForPosition"
            :key="player.id"
            class="available-player"
            @click="setPlayer(player)"
            :class="{ 'in-team': isPlayerInTeam(player.id) }"
          >
            <div class="player-card-mini">
              <div class="player-avatar-mini-container">
                <PlayerAvatar
                  :player="player"
                  size="small"
                  :showShirtNumber="true"
                />
              </div>
              <div class="player-info-mini">
                <div class="player-name-mini">{{ player.name }}</div>
                <div class="player-club-mini">
                  {{ getClubName(player.clubId) }}
                </div>
                <div class="player-rating-mini">{{ player.rating }} ⭐</div>
              </div>
              <div class="rarity-indicator" :class="player.rarity"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Stats -->
      <div class="team-stats" v-if="teamStore.currentTeam">
        <h3 class="stats-title">📊 Team Statistieken</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🥅</div>
            <div class="stat-value">
              {{ teamStore.teamStrengthByPosition.K }}
            </div>
            <div class="stat-label">Keeper</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🛡️</div>
            <div class="stat-value">
              {{ teamStore.teamStrengthByPosition.D }}
            </div>
            <div class="stat-label">Verdediging</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚙️</div>
            <div class="stat-value">
              {{ teamStore.teamStrengthByPosition.M }}
            </div>
            <div class="stat-label">Middenveld</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚽</div>
            <div class="stat-value">
              {{ teamStore.teamStrengthByPosition.A }}
            </div>
            <div class="stat-label">Aanval</div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="team-actions">
        <button
          @click="saveTeam"
          class="action-btn primary"
          :disabled="!teamStore.isTeamComplete"
        >
          💾 Team Opslaan
        </button>
        <button @click="clearTeam" class="action-btn secondary">
          🔄 Team Wissen
        </button>
        <button @click="goToCollection" class="action-btn tertiary">
          🎴 Collectie
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from "vue";
import { useRouter } from "vue-router";
import { useTeamStore, useCollectionStore } from "../stores";
import {
  FootballDataService,
  type PlayerCard,
  type TeamSlot,
} from "../utils/football-data";
import PlayerAvatar from "../components/PlayerAvatar.vue";

const router = useRouter();
const teamStore = useTeamStore();
const collectionStore = useCollectionStore();
const isDataInitialized = inject("isDataInitialized", ref(false));

const teamName = ref("Mijn Team");
const selectedSlot = ref<TeamSlot | null>(null);
const isDataLoaded = ref(false);
const initializationError = ref<string>("");

// Computed
const keeperSlots = computed(
  () =>
    teamStore.currentTeam?.slots.filter((slot) => slot.position === "K") || [],
);

const defenderSlots = computed(
  () =>
    teamStore.currentTeam?.slots.filter((slot) => slot.position === "D") || [],
);

const midfielderSlots = computed(
  () =>
    teamStore.currentTeam?.slots.filter((slot) => slot.position === "M") || [],
);

const attackerSlots = computed(
  () =>
    teamStore.currentTeam?.slots.filter((slot) => slot.position === "A") || [],
);

const availablePlayersForPosition = computed(() => {
  if (!selectedSlot.value || !isDataLoaded.value) return [];
  return collectionStore
    .getPlayersByPosition(selectedSlot.value.position)
    .filter((player) => !isPlayerInTeam(player.id))
    .sort((a, b) => b.rating - a.rating);
});

// Methods
function retryInitialization() {
  window.location.reload();
}

onMounted(async () => {
  // Wait for data initialization from parent
  if (!isDataInitialized.value) {
    const unwatch = watch(isDataInitialized, (initialized) => {
      if (initialized) {
        loadUserPlayers();
        loadTeam();
        unwatch();
      }
    });
  } else {
    loadUserPlayers();
    loadTeam();
  }
});

function loadUserPlayers() {
  isDataLoaded.value = true;
}

function loadTeam() {
  if (!teamStore.currentTeam) {
    teamStore.createNewTeam(teamName.value);
  } else {
    teamName.value = teamStore.currentTeam.name;
  }
}

function selectSlot(slot: TeamSlot) {
  selectedSlot.value = slot;
}

function setPlayer(player: PlayerCard) {
  if (!selectedSlot.value) return;

  const success = teamStore.setPlayerInSlot(
    selectedSlot.value.slotNumber,
    player.id,
  );
  if (success) {
    selectedSlot.value = null;
  }
}

function clearSlot() {
  if (!selectedSlot.value) return;

  teamStore.removePlayerFromSlot(selectedSlot.value.slotNumber);
  selectedSlot.value = null;
}

function clearTeam() {
  if (confirm("Weet je zeker dat je het hele team wilt wissen?")) {
    teamStore.createNewTeam(teamName.value);
    selectedSlot.value = null;
  }
}

function saveTeam() {
  teamStore.saveCurrentTeam();
  alert("Team opgeslagen!");
}

function updateTeamName() {
  if (teamStore.currentTeam) {
    teamStore.currentTeam.name = teamName.value;
  }
}

function getPlayerName(playerId: number): string {
  if (!isDataLoaded.value) return "...";
  const player = FootballDataService.getPlayerById(playerId);
  return player?.name.split(" ").slice(-1)[0] || "???"; // Last name only
}

function getPlayerRating(playerId: number): number {
  if (!isDataLoaded.value) return 0;
  const player = FootballDataService.getPlayerById(playerId);
  return player?.rating || 0;
}

function getClubName(clubId: number): string {
  if (!isDataLoaded.value) return "...";
  const club = FootballDataService.getClubById(clubId);
  return club?.shortName || "Club";
}

function formatPosition(position: string): string {
  const positions = {
    K: "Keeper",
    D: "Verdediger",
    M: "Middenvelder",
    A: "Aanvaller",
  };
  return positions[position as keyof typeof positions] || position;
}

function isPlayerInTeam(playerId: number): boolean {
  if (!teamStore.currentTeam) return false;
  return teamStore.currentTeam.slots.some((slot) => slot.playerId === playerId);
}

function goToCollection() {
  router.push({ name: "VoetbalCollection" });
}
</script>

<style scoped>
@reference "tailwindcss";

.loading-state {
  @apply min-h-screen flex items-center justify-center;
}

.error-state {
  @apply min-h-screen flex items-center justify-center;
}

.team-builder-header {
  @apply text-center;
}

.team-info {
  @apply flex justify-center items-center gap-6;
}

.team-name-input {
  @apply px-4 py-2 text-2xl font-bold rounded-lg text-white focus:outline-none;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.team-name-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
.team-name-input:focus {
  border-color: rgba(255, 255, 255, 0.4);
}

.team-rating {
  @apply text-white;
}

.rating-label {
  @apply text-lg mr-2;
}

.rating-value {
  @apply text-2xl font-bold text-yellow-400;
}

.formation-display {
  @apply bg-gradient-to-b from-green-500 to-green-700 rounded-3xl p-8 border-4 border-white;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 50%, transparent 50%),
    linear-gradient(rgba(255, 255, 255, 0.08) 50%, transparent 50%);
  background-size: 20px 20px;
}

.football-pitch {
  @apply relative h-96 flex flex-col justify-between;
}

.formation-line {
  @apply flex justify-center items-center gap-8;
}

.formation-line.attackers {
  @apply justify-center;
}

.formation-line.midfielders {
  @apply justify-center;
}

.formation-line.defenders {
  @apply justify-center;
}

.formation-line.goalkeeper {
  @apply justify-center;
}

.player-slot {
  @apply w-20 h-20 rounded-full border-2 border-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110;
  background-color: rgba(255, 255, 255, 0.2);
}

.player-slot.selected {
  @apply border-yellow-400 scale-110;
  background-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
}

.player-slot.filled {
  @apply bg-white border-green-500;
}

.player-slot.attacker {
  @apply border-red-400;
  background-color: rgba(248, 113, 113, 0.2);
}

.player-slot.midfielder {
  @apply border-green-400;
  background-color: rgba(74, 222, 128, 0.2);
}

.player-slot.defender {
  @apply border-blue-400;
  background-color: rgba(96, 165, 250, 0.2);
}

.player-slot.keeper {
  @apply border-orange-400;
  background-color: rgba(251, 146, 60, 0.2);
}

.slot-player {
  @apply text-center text-xs;
}

.player-name {
  @apply font-bold text-gray-800 mb-1;
}

.player-rating {
  @apply text-gray-600 font-bold;
}

.empty-slot {
  @apply text-center;
}

.position-label {
  @apply text-white font-bold text-lg;
}

.player-selection-panel {
  @apply backdrop-blur-sm rounded-2xl p-6 mb-8;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header {
  @apply flex justify-between items-center mb-6;
}

.panel-title {
  @apply text-2xl font-bold text-white;
}

.clear-btn {
  @apply px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all;
}

.available-players {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto;
}

.no-players {
  @apply col-span-full text-center py-8 text-white;
}

.collect-btn {
  @apply mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all;
}

.available-player {
  @apply cursor-pointer transform hover:scale-105 transition-all;
}

.available-player.in-team {
  @apply opacity-50 cursor-not-allowed transform-none;
}

.player-card-mini {
  @apply bg-white rounded-lg p-3 shadow-lg relative overflow-hidden;
}

.player-avatar-mini-container {
  @apply flex items-center justify-center mb-2;
}

.player-info-mini {
  @apply text-center;
}

.player-name-mini {
  @apply font-bold text-gray-800 mb-1 text-sm;
}

.player-club-mini {
  @apply text-xs text-gray-600;
}

.player-rating-mini {
  @apply text-sm text-blue-600 font-bold;
}

.rarity-indicator {
  @apply absolute top-0 left-0 w-1 h-full;
}

.rarity-indicator.common {
  @apply bg-gray-500;
}

.rarity-indicator.uncommon {
  @apply bg-green-500;
}

.rarity-indicator.rare {
  @apply bg-blue-500;
}

.rarity-indicator.legendary {
  @apply bg-yellow-500;
}

.team-stats {
  @apply backdrop-blur-sm rounded-2xl p-6 mb-8;
  background-color: rgba(255, 255, 255, 0.05);
}

.stats-title {
  @apply text-2xl font-bold text-white text-center mb-6;
}

.stats-grid {
  @apply grid grid-cols-4 gap-4;
}

.stat-card {
  @apply backdrop-blur-sm rounded-xl p-4 text-center text-white;
  background-color: rgba(255, 255, 255, 0.1);
}

.stat-icon {
  @apply text-2xl mb-2;
}

.stat-value {
  @apply text-2xl font-bold mb-1;
}

.stat-label {
  @apply text-sm opacity-80;
}

.team-actions {
  @apply flex gap-4 justify-center;
}

.action-btn {
  @apply px-8 py-4 font-bold rounded-xl transition-all duration-300 transform hover:scale-105;
}

.action-btn.primary {
  @apply bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:transform-none;
}

.action-btn.secondary {
  @apply bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700;
}

.action-btn.tertiary {
  @apply text-white;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.action-btn.tertiary:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
