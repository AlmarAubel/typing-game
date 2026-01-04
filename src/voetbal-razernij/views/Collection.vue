<template>
  <div class="collection-view">
    <!-- Header -->
    <div class="collection-header mb-8">
      <h1 class="text-4xl font-bold text-white text-center mb-4">
        🎴 Jouw Collectie
      </h1>
      <div class="collection-stats-bar">
        <div class="stat">
          <span class="stat-icon">👥</span>
          <span class="stat-value">{{
            collectionStore.collectionStats.totalUniquePlayers
          }}</span>
          <span class="stat-label">Unieke Spelers</span>
        </div>
        <div class="stat">
          <span class="stat-icon">🎴</span>
          <span class="stat-value">{{
            collectionStore.collectionStats.totalCardsOwned
          }}</span>
          <span class="stat-label">Totaal Kaarten</span>
        </div>
        <div class="stat">
          <span class="stat-icon">📊</span>
          <span class="stat-value"
            >{{ Math.round(collectionStore.collectionCompletion) }}%</span
          >
          <span class="stat-label">Volledigheid</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="collection-filters mb-8">
      <div class="filter-group">
        <label class="filter-label">Club:</label>
        <select v-model="selectedClub" class="filter-select">
          <option value="">Alle clubs</option>
          <option v-for="club in clubs" :key="club.id" :value="club.id">
            {{ club.name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Positie:</label>
        <select v-model="selectedPosition" class="filter-select">
          <option value="">Alle posities</option>
          <option value="K">Keeper</option>
          <option value="D">Verdediger</option>
          <option value="M">Middenvelder</option>
          <option value="A">Aanvaller</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Zeldzaamheid:</label>
        <select v-model="selectedRarity" class="filter-select">
          <option value="">Alle rariteiten</option>
          <option value="common">Gewoon</option>
          <option value="uncommon">Ongewoon</option>
          <option value="rare">Zeldzaam</option>
          <option value="legendary">Legendarisch</option>
        </select>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredCards.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3 class="empty-title">Geen kaarten gevonden</h3>
      <p class="empty-text">
        {{
          collectionStore.allPlayerCards.length === 0
            ? "Je hebt nog geen spelers verzameld. Speel sessies en open pakketten om je collectie te starten!"
            : "Geen kaarten voldoen aan je filters. Probeer andere filtercriteria."
        }}
      </p>
      <button
        v-if="collectionStore.allPlayerCards.length === 0"
        @click="goToTableSelect"
        class="empty-action"
      >
        🏠 Start met Oefenen
      </button>
    </div>

    <!-- Cards Grid -->
    <div v-else class="cards-grid">
      <div
        v-for="card in filteredCards"
        :key="card.id"
        class="player-card"
        :class="[card.rarity]"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="position-badge" :class="card.position">
            {{ formatPosition(card.position) }}
          </div>
          <div class="copies-badge" v-if="card.copies > 1">
            {{ card.copies }}x
          </div>
        </div>

        <!-- Player Avatar -->
        <div class="player-avatar-container">
          <PlayerAvatar :player="card" size="medium" :showShirtNumber="true" />
        </div>

        <!-- Player Info -->
        <div class="player-info">
          <h3 class="player-name">{{ card.name }}</h3>
          <div class="player-club">{{ getClubName(card.clubId) }}</div>
          <div class="player-rating">
            <span class="rating-value">{{ card.rating }}</span>
            <div class="rating-stars">
              <span
                v-for="star in getRatingStars(card.rating)"
                :key="star"
                class="star"
                >⭐</span
              >
            </div>
          </div>
        </div>

        <!-- Rarity Banner -->
        <div class="rarity-banner" :class="card.rarity">
          <span class="rarity-text">{{ formatRarity(card.rarity) }}</span>
        </div>

        <!-- Card Actions -->
        <div class="card-actions">
          <button
            @click="addToTeam(card)"
            class="action-btn"
            :disabled="isInTeam(card.id)"
          >
            {{ isInTeam(card.id) ? "✅ In Team" : "➕ Aan Team" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Club Shops Section -->
    <div v-if="clubs.length > 0" class="club-shops-section">
      <h2 class="section-title">🏪 Club Winkels</h2>
      <p class="section-subtitle">
        Bezoek de club winkels om nieuwe spelers pakketten te kopen met je
        verdiende tokens!
      </p>
      <div class="club-shops-grid">
        <div
          v-for="club in clubs.slice(0, 10)"
          :key="club.id"
          class="club-shop-card"
          @click="openClubStore(club.id)"
          :style="{ '--club-color': club.primaryColor || '#1976D2' }"
        >
          <div class="club-badge">
            <span class="text-3xl">🏆</span>
          </div>
          <div class="club-name">{{ club.shortName }}</div>
          <div class="club-full-name">{{ club.name }}</div>
          <div class="shop-action">
            <span>🏪 Bezoek Winkel</span>
          </div>
        </div>
        <div class="club-shop-card see-all-card" @click="goToTableSelect">
          <div class="club-badge">
            <span class="text-3xl">➕</span>
          </div>
          <div class="club-name">Alle Clubs</div>
          <div class="shop-action">
            <span>🏠 Bekijk Alle Clubs</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="bottom-actions">
      <button @click="goToTeamBuilder" class="main-btn">
        ⚽ Team Samenstellen
      </button>
      <button @click="goToTableSelect" class="main-btn secondary">
        🏠 Meer Spelers Verzamelen
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from "vue";
import { useRouter } from "vue-router";
import { useCollectionStore, useTeamStore } from "../stores";
import { FootballDataService, type PlayerCard } from "../utils/football-data";
import PlayerAvatar from "../components/PlayerAvatar.vue";

const router = useRouter();
const collectionStore = useCollectionStore();
const teamStore = useTeamStore();
const isDataInitialized = inject("isDataInitialized", ref(false));

const selectedClub = ref<number | string>("");
const selectedPosition = ref<string>("");
const selectedRarity = ref<string>("");

const clubs = computed(() => FootballDataService.getAllClubs());

const filteredCards = computed(() => {
  let cards = collectionStore.allPlayerCards;

  if (selectedClub.value) {
    cards = cards.filter((card) => card.clubId === selectedClub.value);
  }

  if (selectedPosition.value) {
    cards = cards.filter((card) => card.position === selectedPosition.value);
  }

  if (selectedRarity.value) {
    cards = cards.filter((card) => card.rarity === selectedRarity.value);
  }

  return cards.sort((a, b) => b.rating - a.rating);
});

onMounted(async () => {
  // Wait for data initialization from parent
  if (!isDataInitialized.value) {
    const unwatch = watch(isDataInitialized, (initialized) => {
      if (initialized) {
        loadData();
        unwatch();
      }
    });
  } else {
    loadData();
  }
});

function loadData() {
  // Data loading logic can go here if needed
}

function formatPosition(position: string): string {
  const positions = {
    K: "K",
    D: "V",
    M: "M",
    A: "A",
  };
  return positions[position as keyof typeof positions] || position;
}

function formatRarity(rarity: string): string {
  const rarities = {
    common: "Gewoon",
    uncommon: "Ongewoon",
    rare: "Zeldzaam",
    legendary: "Legendarisch",
  };
  return rarities[rarity as keyof typeof rarities] || rarity;
}

function getClubName(clubId: number): string {
  const club = FootballDataService.getClubById(clubId);
  return club?.shortName || "Club";
}

function getRatingStars(rating: number): number {
  return Math.min(5, Math.ceil(rating / 20));
}

function isInTeam(playerId: number): boolean {
  if (!teamStore.currentTeam) return false;
  return teamStore.currentTeam.slots.some((slot) => slot.playerId === playerId);
}

function addToTeam(card: PlayerCard) {
  if (!teamStore.currentTeam) {
    teamStore.createNewTeam("Mijn Team");
  }

  // Find available slot for this position
  const availableSlot = teamStore.currentTeam!.slots.find(
    (slot) => slot.position === card.position && !slot.playerId,
  );

  if (availableSlot) {
    teamStore.setPlayerInSlot(availableSlot.slotNumber, card.id);
  }
}

function goToTeamBuilder() {
  router.push({ name: "VoetbalTeamBuilder" });
}

function goToTableSelect() {
  router.push({ name: "VoetbalTableSelect" });
}

function openClubStore(clubId: number) {
  router.push({
    name: "VoetbalClubStore",
    params: { clubId: clubId.toString() },
  });
}
</script>

<style scoped>
@reference "tailwindcss";

.collection-header {
  @apply text-center;
}

.collection-stats-bar {
  @apply flex justify-center gap-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20;
}

.stat {
  @apply text-center text-white;
}

.stat-icon {
  @apply block text-2xl mb-2;
}

.stat-value {
  @apply block text-2xl font-bold mb-1;
}

.stat-label {
  @apply text-sm opacity-80;
}

.collection-filters {
  @apply flex flex-wrap gap-4 justify-center bg-white/5 backdrop-blur-sm rounded-2xl p-6;
}

.filter-group {
  @apply flex items-center gap-2;
}

.filter-label {
  @apply text-white font-medium;
}

.filter-select {
  @apply px-3 py-2 bg-white rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none;
}

.empty-state {
  @apply text-center py-16;
}

.empty-icon {
  @apply text-8xl mb-4;
}

.empty-title {
  @apply text-2xl font-bold text-white mb-4;
}

.empty-text {
  @apply text-white/80 mb-8 max-w-md mx-auto;
}

.empty-action {
  @apply px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all;
}

.cards-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8;
}

.player-card {
  @apply bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300;
}

.player-card.common {
  @apply border-l-4 border-gray-500;
}

.player-card.uncommon {
  @apply border-l-4 border-green-500;
}

.player-card.rare {
  @apply border-l-4 border-blue-500;
}

.player-card.legendary {
  @apply border-l-4 border-yellow-500;
  box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3);
}

.card-header {
  @apply flex justify-between p-3;
}

.position-badge {
  @apply px-3 py-1 rounded-full text-white font-bold text-sm;
}

.position-badge.K {
  @apply bg-orange-500;
}

.position-badge.D {
  @apply bg-blue-500;
}

.position-badge.M {
  @apply bg-green-500;
}

.position-badge.A {
  @apply bg-red-500;
}

.copies-badge {
  @apply px-2 py-1 bg-purple-500 text-white rounded-full text-xs font-bold;
}

.player-avatar-container {
  @apply flex items-center justify-center py-4;
}

.player-info {
  @apply p-4 text-center border-t border-gray-100;
}

.player-name {
  @apply text-lg font-bold mb-1 text-gray-800;
}

.player-club {
  @apply text-sm text-gray-600 mb-2;
}

.player-rating {
  @apply flex items-center justify-between;
}

.rating-value {
  @apply text-xl font-bold text-blue-600;
}

.rating-stars {
  @apply flex;
}

.star {
  @apply text-xs;
}

.rarity-banner {
  @apply text-center py-2 text-white font-bold text-sm;
}

.rarity-banner.common {
  @apply bg-gray-500;
}

.rarity-banner.uncommon {
  @apply bg-green-500;
}

.rarity-banner.rare {
  @apply bg-blue-500;
}

.rarity-banner.legendary {
  @apply bg-yellow-500;
}

.card-actions {
  @apply p-3;
}

.action-btn {
  @apply w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all;
}

.bottom-actions {
  @apply flex gap-4 justify-center;
}

.main-btn {
  @apply px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105;
}

.main-btn.secondary {
  @apply from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700;
}

/* Club Shops Section */
.club-shops-section {
  @apply max-w-6xl mx-auto mb-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  @apply text-3xl font-bold text-white text-center mb-2;
}

.section-subtitle {
  @apply text-center text-gray-300 mb-6;
}

.club-shops-grid {
  @apply grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4;
}

.club-shop-card {
  @apply relative backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 cursor-pointer;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--club-color, #1976d2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.club-shop-card:hover {
  box-shadow: 0 8px 32px var(--club-color);
  background-color: rgba(255, 255, 255, 0.15);
}

.see-all-card {
  --club-color: #6b7280;
}

.club-badge {
  @apply text-center mb-2;
}

.club-name {
  @apply text-center font-bold text-white text-sm mb-1;
}

.club-full-name {
  @apply text-center text-xs text-gray-300 mb-3;
}

.shop-action {
  @apply text-center;
}

.shop-action span {
  @apply text-xs text-white/80 font-medium;
}
</style>
