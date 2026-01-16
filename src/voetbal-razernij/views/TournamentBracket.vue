<template>
  <div class="tournament-bracket min-h-screen p-6">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-5xl font-bold text-white mb-2">🏆 Champions League</h1>
      <p class="text-xl text-white/80">
        Tafels: {{ tournament?.selectedTables.join(", ") }}
      </p>
      <div class="mt-4 flex justify-center gap-6">
        <div class="stat-badge">
          <span class="text-2xl">✅</span>
          <span class="font-bold text-white"
            >{{ tournament?.victories || 0 }} Overwinningen</span
          >
        </div>
        <div class="stat-badge">
          <span class="text-2xl">❌</span>
          <span class="font-bold text-white"
            >{{ tournament?.defeats || 0 }} Nederlagen</span
          >
        </div>
        <button
          @click="router.push({ name: 'VoetbalChampionsStore' })"
          class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-all"
        >
          <span>🛍️</span>
          <span>Store</span>
          <span class="bg-black/20 px-2 rounded-full text-sm"
            >{{ tournamentStore.totalMedals }} 🥇</span
          >
        </button>
        <button
          @click="pauseTournament"
          class="bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-all"
        >
          <span>⏸️</span>
          <span>Pauze</span>
        </button>
      </div>
    </div>

    <!-- Tournament Bracket -->
    <div v-if="tournament" class="bracket-container max-w-6xl mx-auto">
      <!-- Group Stage -->
      <div class="phase-section mb-8">
        <h2 class="phase-title">Voorronde (Groepsfase)</h2>
        <p class="phase-subtitle">Win minimaal 2 wedstrijden om door te gaan</p>
        <div class="matches-grid">
          <div
            v-for="(match, idx) in matchesByPhase.group"
            :key="match.id"
            class="match-card"
            :class="{
              completed: match.completed,
              active: !match.completed && currentMatch?.id === match.id,
              won:
                match.completed &&
                (match.playerScore || 0) > (match.opponentScore || 0),
              lost:
                match.completed &&
                (match.playerScore || 0) < (match.opponentScore || 0),
            }"
          >
            <div class="match-header">Wedstrijd {{ idx + 1 }}</div>
            <div class="match-opponent">
              <span class="text-2xl">⚽</span>
              <span>{{ getClubName(match.opponentClubId) }}</span>
            </div>
            <div v-if="match.completed" class="match-score">
              {{ match.playerScore }} - {{ match.opponentScore }}
            </div>
            <button
              v-if="!match.completed && currentMatch?.id === match.id"
              @click="playMatch(match)"
              class="play-btn"
            >
              ▶️ Speel Nu
            </button>
            <div
              v-if="!match.completed && currentMatch?.id !== match.id"
              class="locked"
            >
              🔒 Vergrendeld
            </div>
          </div>
        </div>
      </div>

      <!-- Quarter Final -->
      <div v-if="matchesByPhase.quarter.length > 0" class="phase-section mb-8">
        <h2 class="phase-title">Kwartfinale</h2>
        <div class="matches-grid">
          <div
            v-for="match in matchesByPhase.quarter"
            :key="match.id"
            class="match-card"
            :class="{
              completed: match.completed,
              active: !match.completed && currentMatch?.id === match.id,
              won:
                match.completed &&
                (match.playerScore || 0) > (match.opponentScore || 0),
              lost:
                match.completed &&
                (match.playerScore || 0) < (match.opponentScore || 0),
            }"
          >
            <div class="match-header">Kwartfinale</div>
            <div class="match-opponent">
              <span class="text-2xl">⚽</span>
              <span>{{ getClubName(match.opponentClubId) }}</span>
            </div>
            <div v-if="match.completed" class="match-score">
              {{ match.playerScore }} - {{ match.opponentScore }}
            </div>
            <button
              v-if="!match.completed && currentMatch?.id === match.id"
              @click="playMatch(match)"
              class="play-btn"
            >
              ▶️ Speel Nu
            </button>
          </div>
        </div>
      </div>

      <!-- Semi Final -->
      <div v-if="matchesByPhase.semi.length > 0" class="phase-section mb-8">
        <h2 class="phase-title">Halve Finale</h2>
        <div class="matches-grid">
          <div
            v-for="match in matchesByPhase.semi"
            :key="match.id"
            class="match-card"
            :class="{
              completed: match.completed,
              active: !match.completed && currentMatch?.id === match.id,
              won:
                match.completed &&
                (match.playerScore || 0) > (match.opponentScore || 0),
              lost:
                match.completed &&
                (match.playerScore || 0) < (match.opponentScore || 0),
            }"
          >
            <div class="match-header">Halve Finale</div>
            <div class="match-opponent">
              <span class="text-2xl">⚽</span>
              <span>{{ getClubName(match.opponentClubId) }}</span>
            </div>
            <div v-if="match.completed" class="match-score">
              {{ match.playerScore }} - {{ match.opponentScore }}
            </div>
            <button
              v-if="!match.completed && currentMatch?.id === match.id"
              @click="playMatch(match)"
              class="play-btn"
            >
              ▶️ Speel Nu
            </button>
          </div>
        </div>
      </div>

      <!-- Final -->
      <div v-if="matchesByPhase.final.length > 0" class="phase-section mb-8">
        <h2 class="phase-title">🏆 Finale 🏆</h2>
        <div class="matches-grid justify-center">
          <div
            v-for="match in matchesByPhase.final"
            :key="match.id"
            class="match-card final-card"
            :class="{
              completed: match.completed,
              active: !match.completed && currentMatch?.id === match.id,
              won:
                match.completed &&
                (match.playerScore || 0) > (match.opponentScore || 0),
              lost:
                match.completed &&
                (match.playerScore || 0) < (match.opponentScore || 0),
            }"
          >
            <div class="match-header">FINALE</div>
            <div class="match-opponent">
              <span class="text-3xl">⚽</span>
              <span class="text-xl">{{
                getClubName(match.opponentClubId)
              }}</span>
            </div>
            <div v-if="match.completed" class="match-score text-3xl">
              {{ match.playerScore }} - {{ match.opponentScore }}
            </div>
            <button
              v-if="!match.completed && currentMatch?.id === match.id"
              @click="playMatch(match)"
              class="play-btn"
            >
              ▶️ Speel Finale!
            </button>
          </div>
        </div>
      </div>

      <!-- Elimination Message -->
      <div
        v-if="!tournament.isActive && !isQualified"
        class="elimination-message"
      >
        <h2 class="text-4xl font-bold text-red-400 mb-4">❌ Uitgeschakeld</h2>
        <p class="text-xl text-white/80 mb-6">
          Je hebt niet genoeg wedstrijden gewonnen om door te gaan naar de
          volgende ronde.
        </p>
        <button
          @click="goHome"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full"
        >
          Terug naar Menu
        </button>
      </div>

      <!-- Victory Message -->
      <div
        v-if="
          !tournament.isActive &&
          isQualified &&
          matchesByPhase.final[0]?.completed
        "
        class="victory-message"
      >
        <h2 class="text-5xl font-bold text-yellow-400 mb-4">🏆 KAMPIOEN! 🏆</h2>
        <p class="text-2xl text-white/90 mb-6">
          Je hebt het Champions League toernooi gewonnen!
        </p>
        <button
          @click="goHome"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full"
        >
          Terug naar Menu
        </button>
      </div>
    </div>

    <!-- No Tournament Active -->
    <div v-else class="text-center text-white">
      <p class="text-xl mb-6">Geen actief toernooi.</p>
      <button
        @click="goHome"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full"
      >
        Terug naar Menu
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useTournamentStore } from "../stores/tournament";
import { FootballDataService } from "../utils/football-data";
import { useVoetbalGameStore } from "../stores";
import type { TournamentMatch } from "../stores/tournament";

const router = useRouter();
const tournamentStore = useTournamentStore();
const gameStore = useVoetbalGameStore();

const tournament = computed(() => tournamentStore.tournament);
const currentMatch = computed(() => tournamentStore.currentMatch);
const isQualified = computed(() => tournamentStore.isQualified);
const matchesByPhase = computed(() => tournamentStore.matchesByPhase);

function getClubName(clubId: number): string {
  const club = FootballDataService.getClubById(clubId);
  return club?.name || "Onbekend";
}

function playMatch(match: TournamentMatch) {
  // Start battle with this opponent
  gameStore.startBattle(match.opponentClubId, match.tables);
  router.push({ name: "VoetbalMatch" });
}

function pauseTournament() {
  router.push({ name: "VoetbalTournamentSelect" });
}

function goHome() {
  tournamentStore.endTournament();
  router.push({ name: "VoetbalTableSelect" });
}
</script>

<style scoped>
@reference "tailwindcss";

.tournament-bracket {
  background: linear-gradient(180deg, #1a472a 0%, #0d2818 100%);
}

.stat-badge {
  @apply bg-white/10 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 border border-white/20;
}

.bracket-container {
  @apply bg-black/20 backdrop-blur rounded-3xl p-8 border border-white/10;
}

.phase-section {
  @apply mb-12;
}

.phase-title {
  @apply text-3xl font-bold text-white text-center mb-2;
}

.phase-subtitle {
  @apply text-center text-white/70 mb-6;
}

.matches-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.match-card {
  @apply bg-white/10 backdrop-blur rounded-xl p-6 border-2 border-white/20 transition-all;
}

.match-card.active {
  @apply border-yellow-400 ring-4 ring-yellow-400/50 animate-pulse;
}

.match-card.completed.won {
  @apply bg-green-900/30 border-green-400;
}

.match-card.completed.lost {
  @apply bg-red-900/30 border-red-400;
}

.match-header {
  @apply text-center font-bold text-white/60 text-sm uppercase mb-3;
}

.match-opponent {
  @apply text-center text-white text-lg font-bold mb-3 flex flex-col items-center gap-2;
}

.match-score {
  @apply text-center text-2xl font-black text-white mb-3;
}

.play-btn {
  @apply w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all;
}

.locked {
  @apply text-center text-white/40 py-2;
}

.final-card {
  @apply md:col-span-1 border-4 border-yellow-400 bg-gradient-to-br from-yellow-900/30 to-orange-900/30;
}

.elimination-message,
.victory-message {
  @apply text-center bg-black/40 backdrop-blur rounded-2xl p-8 mt-8;
}
</style>
