<template>
  <div class="pack-opening">
    <!-- Background -->
    <div class="pack-opening-bg">
      <div class="bg-particles">
        <div v-for="i in 20" :key="i" class="particle" :style="{
          '--delay': Math.random() * 2 + 's',
          '--x': Math.random() * 100 + '%',
          '--y': Math.random() * 100 + '%'
        }"></div>
      </div>
    </div>

    <!-- Pack Opening Sequence -->
    <div v-if="!isComplete" class="pack-opening-sequence">
      <!-- Pack Display -->
      <div class="pack-display">
        <div
          class="pack-3d"
          :class="{ 'pack-opening': isOpening, [packType]: true }"
          @click="startOpening"
        >
          <div class="pack-face pack-front">
            <div class="pack-icon">
              <span v-if="packType === 'bronze'">🥉</span>
              <span v-if="packType === 'silver'">🥈</span>
              <span v-if="packType === 'gold'">🥇</span>
            </div>
            <div class="pack-title">{{ packTitle }}</div>
            <div class="club-name">{{ club?.name || 'Club' }}</div>
            <div v-if="!isOpening" class="pack-prompt">
              👆 Tik om te openen!
            </div>
          </div>
          <div class="pack-face pack-back">
            <div class="pack-contents-preview">
              <div class="cards-flying">
                <div v-for="i in cardCount" :key="i" class="card-mini" :style="{ '--delay': i * 0.1 + 's' }">🎴</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Opening Instructions -->
      <div v-if="!isOpening" class="opening-instructions">
        <h2 class="text-3xl font-bold text-white mb-4">🎁 {{ packTitle }}</h2>
        <p class="text-xl mb-6" style="color: rgba(255, 255, 255, 0.9);">
          Bevat {{ cardCount }} spelers van {{ club?.name || 'de club' }}
        </p>
        <p style="color: rgba(255, 255, 255, 0.8);">
          Tik op het pakket om het te openen en je nieuwe spelers te ontdekken!
        </p>
      </div>

      <!-- Opening Animation -->
      <div v-if="isOpening && !showCards" class="opening-animation">
        <div class="opening-text">
          <h2 class="text-4xl font-bold text-white mb-4 animate-pulse">
            ✨ Pakket wordt geopend...
          </h2>
          <div class="loading-dots">
            <span>⚽</span>
            <span>⚽</span>
            <span>⚽</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Results -->
    <div v-if="showCards" class="card-results">
      <div class="results-header mb-8">
        <h2 class="text-4xl font-bold text-white mb-2">🎉 Nieuwe Spelers!</h2>
        <p class="text-xl" style="color: rgba(255, 255, 255, 0.9);">{{ club?.name || 'Club' }} • {{ packTitle }}</p>
      </div>

      <div class="cards-grid">
        <div
          v-for="(card, index) in obtainedCards"
          :key="card.player.id"
          class="player-card"
          :class="[card.player.rarity, { 'card-duplicate': card.isDuplicate }]"
          :style="{ '--delay': index * 0.2 + 's' }"
        >
          <!-- Card Front -->
          <div class="card-front">
            <!-- Rarity Glow -->
            <div class="rarity-glow" :class="card.player.rarity"></div>

            <!-- Player Image Area -->
            <div class="player-image-area">
              <div class="position-badge">{{ formatPosition(card.player.position) }}</div>
              <PlayerAvatar :player="card.player" size="large" :showShirtNumber="true" />
            </div>

            <!-- Player Info -->
            <div class="player-info">
              <h3 class="player-name">{{ card.player.name }}</h3>
              <div class="player-rating">
                <span class="rating-value">{{ card.player.rating }}</span>
                <div class="rating-stars">
                  <span v-for="star in getRatingStars(card.player.rating)" :key="star" class="star">⭐</span>
                </div>
              </div>
            </div>

            <!-- Rarity Banner -->
            <div class="rarity-banner" :class="card.player.rarity">
              <span class="rarity-text">{{ formatRarity(card.player.rarity) }}</span>
              <span class="rarity-icon">
                <span v-if="card.player.rarity === 'common'">⚪</span>
                <span v-if="card.player.rarity === 'uncommon'">🟢</span>
                <span v-if="card.player.rarity === 'rare'">🔵</span>
                <span v-if="card.player.rarity === 'legendary'">🟡</span>
              </span>
            </div>

            <!-- Duplicate Indicator -->
            <div v-if="card.isDuplicate" class="duplicate-badge">
              <span>🔄 Kopie #{{ card.copyNumber }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="results-summary">
        <div class="summary-stats">
          <div class="summary-stat">
            <div class="stat-icon">🎴</div>
            <div class="stat-value">{{ obtainedCards.length }}</div>
            <div class="stat-label">Nieuwe kaarten</div>
          </div>
          <div class="summary-stat">
            <div class="stat-icon">🔄</div>
            <div class="stat-value">{{ duplicateCount }}</div>
            <div class="stat-label">Duplicaten</div>
          </div>
          <div class="summary-stat">
            <div class="stat-icon">💎</div>
            <div class="stat-value">{{ rareOrBetterCount }}</div>
            <div class="stat-label">Zeldzaam+</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="openAnotherPack" class="action-btn primary" :disabled="!canAffordAnother">
            🎁 Nog een pakket ({{ packCost }} 🎟️)
          </button>
          <button @click="viewCollection" class="action-btn secondary">
            📚 Bekijk Collectie
          </button>
          <button @click="buildTeam" class="action-btn secondary">
            ⚽ Team Samenstellen
          </button>
          <button @click="backToStore" class="action-btn tertiary">
            🏪 Terug naar Winkel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClubProgressStore, useCollectionStore } from '../stores';
import { FootballDataService, type Player, type PlayerCard } from '../utils/football-data';
import { BALANCE_CONFIG } from '../utils/balance-config';
import PlayerAvatar from '../components/PlayerAvatar.vue';

const route = useRoute();
const router = useRouter();
const clubProgressStore = useClubProgressStore();
const collectionStore = useCollectionStore();

// Props from route
const clubId = ref<number>(parseInt(route.params.clubId as string));
const packType = ref<'bronze' | 'silver' | 'gold'>(route.params.packType as 'bronze' | 'silver' | 'gold');

// State
const isOpening = ref(false);
const showCards = ref(false);
const isComplete = ref(false);
const obtainedCards = ref<Array<{ player: Player; isDuplicate: boolean; copyNumber: number }>>([]);

// Computed
const club = computed(() => FootballDataService.getClubById(clubId.value));
const clubProgress = computed(() => clubProgressStore.getClubProgress(clubId.value));

const packTitle = computed(() => {
  const titles = {
    bronze: '🥉 Bronze Pack',
    silver: '🥈 Silver Pack',
    gold: '🥇 Gold Pack'
  };
  return titles[packType.value];
});

const cardCount = computed(() => BALANCE_CONFIG.packs[packType.value].cardCount);
const packCost = computed(() => BALANCE_CONFIG.packs[packType.value].cost);

const duplicateCount = computed(() => obtainedCards.value.filter(card => card.isDuplicate).length);
const rareOrBetterCount = computed(() =>
  obtainedCards.value.filter(card => ['rare', 'legendary'].includes(card.player.rarity)).length
);

const canAffordAnother = computed(() => {
  return (clubProgress.value?.totalTokens || 0) >= packCost.value;
});

// Methods
onMounted(() => {
  initializePackOpening();
});

async function initializePackOpening() {
  await FootballDataService.initialize();
}

function startOpening() {
  if (isOpening.value) return;

  isOpening.value = true;

  // Start pack opening animation
  setTimeout(() => {
    showCards.value = true;
    try {
      generatePackContents();
    } catch (error) {
      console.error('Failed to generate pack contents:', error);
      // Reset state on error
      isOpening.value = false;
      showCards.value = false;
    }
  }, 3000);
}

function generatePackContents() {
  const clubPlayers = FootballDataService.getPlayersByClub(clubId.value);
  const cards: Array<{ player: Player; isDuplicate: boolean; copyNumber: number }> = [];

  // Safety check: ensure we have players for this club
  if (!clubPlayers || clubPlayers.length === 0) {
    console.error(`No players found for club ${clubId.value}`);
    return;
  }

  for (let i = 0; i < cardCount.value; i++) {
    const rarity = generateRarity();
    const availablePlayers = clubPlayers.filter(p => p.rarity === rarity);

    let player: Player;

    if (availablePlayers.length === 0) {
      // Fallback to any rarity if none available
      player = clubPlayers[Math.floor(Math.random() * clubPlayers.length)];
    } else {
      player = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    }

    // Safety check: ensure player is valid
    if (!player || !player.id) {
      console.error('Generated invalid player:', player);
      continue;
    }

    const cardResult = collectionStore.addPlayerCard(player);
    cards.push({
      player,
      isDuplicate: cardResult.copies > 1,
      copyNumber: cardResult.copies
    });
  }

  obtainedCards.value = cards;
  isComplete.value = true;
}

function generateRarity(): string {
  const random = Math.random() * 100;
  const rarities = BALANCE_CONFIG.rarity.distribution;

  let cumulative = 0;
  for (const [rarity, chance] of Object.entries(rarities)) {
    cumulative += chance;
    if (random <= cumulative) {
      return rarity;
    }
  }

  return 'common'; // Fallback
}

function getRatingStars(rating: number): number {
  return Math.min(5, Math.ceil(rating / 20));
}

function formatPosition(position: string): string {
  const positions = {
    'K': 'Keeper',
    'D': 'Verdediger',
    'M': 'Middenvelder',
    'A': 'Aanvaller'
  };
  return positions[position as keyof typeof positions] || position;
}

function formatRarity(rarity: string): string {
  const rarities = {
    'common': 'Gewoon',
    'uncommon': 'Ongewoon',
    'rare': 'Zeldzaam',
    'legendary': 'Legendarisch'
  };
  return rarities[rarity as keyof typeof rarities] || rarity;
}

function openAnotherPack() {
  if (!canAffordAnother.value) return;

  const success = clubProgressStore.spendTokens(clubId.value, packCost.value);
  if (success) {
    // Go back to store to open another pack
    router.push({
      name: 'VoetbalClubStore',
      params: { clubId: clubId.value.toString() }
    });
  }
}

function viewCollection() {
  router.push({ name: 'VoetbalCollection' });
}

function buildTeam() {
  router.push({ name: 'VoetbalTeamBuilder' });
}

function backToStore() {
  router.push({ name: 'VoetbalClubStore', params: { clubId: clubId.value.toString() } });
}
</script>

<style scoped>
@reference "tailwindcss";

.pack-opening {
  @apply min-h-screen relative overflow-hidden;
}

.pack-opening-bg {
  @apply absolute inset-0;
  background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.2), transparent),
              linear-gradient(135deg, #1e293b, #0f172a);
}

.bg-particles {
  @apply absolute inset-0;
}

.particle {
  @apply absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30;
  animation: particle-float 4s infinite ease-in-out;
  animation-delay: var(--delay);
  left: var(--x);
  top: var(--y);
}

.pack-opening-sequence {
  @apply flex flex-col items-center justify-center min-h-screen p-8;
}

.pack-display {
  @apply mb-12;
  perspective: 1000px;
}

.pack-3d {
  @apply relative w-64 h-80 cursor-pointer;
  transform-style: preserve-3d;
  transition: transform 0.6s ease-in-out;
}

.pack-3d:hover {
  transform: rotateY(10deg) rotateX(5deg) scale(1.05);
}

.pack-3d.pack-opening {
  animation: pack-shake 0.5s ease-in-out, pack-explode 0.5s ease-in-out 2.5s;
}

.pack-face {
  @apply absolute inset-0 rounded-3xl p-6 flex flex-col items-center justify-center text-center;
  backface-visibility: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.pack-front {
  background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
  border: 4px solid #gold;
}

.pack-3d.bronze .pack-front {
  border-color: #cd7f32;
  background: linear-gradient(135deg, #fef3c7, #fbbf24);
}

.pack-3d.silver .pack-front {
  border-color: #c0c0c0;
  background: linear-gradient(135deg, #f1f5f9, #cbd5e1);
}

.pack-3d.gold .pack-front {
  border-color: #ffd700;
  background: linear-gradient(135deg, #fef9c3, #facc15);
}

.pack-back {
  @apply bg-gradient-to-br from-purple-600 to-blue-600;
  transform: rotateY(180deg);
}

.pack-icon {
  @apply text-6xl mb-4;
}

.pack-title {
  @apply text-2xl font-bold mb-2 text-gray-800;
}

.club-name {
  @apply text-lg font-medium mb-4 text-gray-700;
}

.pack-prompt {
  @apply text-sm text-gray-600 animate-pulse;
}

.cards-flying {
  @apply flex flex-wrap gap-2;
}

.card-mini {
  @apply text-2xl;
  animation: card-fly 2s infinite ease-in-out;
  animation-delay: var(--delay);
}

.opening-instructions {
  @apply text-center max-w-md;
}

.opening-animation {
  @apply text-center;
}

.loading-dots {
  @apply flex justify-center gap-2 text-4xl;
}

.loading-dots span {
  animation: bounce 1.5s ease-in-out infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.3s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.6s;
}

.card-results {
  @apply container mx-auto px-4 py-8;
}

.results-header {
  @apply text-center;
}

.cards-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12;
}

.player-card {
  @apply relative bg-white rounded-3xl shadow-2xl overflow-hidden transform cursor-default;
  animation: card-appear 0.8s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateY(50px) rotateX(15deg);
  width: 200px;
  height: 280px;
  transition: none;
}

.player-card:hover {
  transform: translateY(50px) rotateX(15deg) scale(1.02);
}

.player-card.common {
  box-shadow: 0 20px 60px rgba(107, 114, 128, 0.4);
}

.player-card.uncommon {
  box-shadow: 0 20px 60px rgba(34, 197, 94, 0.4);
}

.player-card.rare {
  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);
}

.player-card.legendary {
  box-shadow: 0 20px 60px rgba(251, 191, 36, 0.6);
  animation: legendary-glow 2s ease-in-out infinite alternate;
}

.rarity-glow {
  @apply absolute inset-0 opacity-20 pointer-events-none;
}

.rarity-glow.common {
  background: radial-gradient(circle, #6b7280 0%, transparent 70%);
}

.rarity-glow.uncommon {
  background: radial-gradient(circle, #22c55e 0%, transparent 70%);
}

.rarity-glow.rare {
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
}

.rarity-glow.legendary {
  background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
  animation: legendary-pulse 2s ease-in-out infinite;
}

.card-front {
  @apply p-6 h-full flex flex-col;
}

.player-image-area {
  @apply relative flex-1 flex items-center justify-center mb-4;
}

.position-badge {
  @apply absolute top-0 left-0 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold;
}

.player-info {
  @apply text-center;
}

.player-name {
  @apply text-xl font-bold mb-3 text-gray-800;
}

.player-rating {
  @apply flex items-center justify-between;
}

.rating-value {
  @apply text-2xl font-black text-blue-600;
}

.rating-stars {
  @apply flex;
}

.star {
  @apply text-sm;
}

.rarity-banner {
  @apply absolute bottom-0 left-0 right-0 text-center py-2 text-white font-bold;
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

.duplicate-badge {
  @apply absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold;
}

.results-summary {
  @apply text-center;
}

.summary-stats {
  @apply grid grid-cols-3 gap-6 max-w-md mx-auto mb-8;
}

.summary-stat {
  @apply backdrop-blur-sm rounded-xl p-4 text-white;
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

.action-buttons {
  @apply flex flex-wrap gap-4 justify-center;
}

.action-btn {
  @apply px-6 py-3 font-bold rounded-xl transition-all duration-300 transform hover:scale-105;
}

.action-btn.primary {
  @apply bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:transform-none;
}

.action-btn.secondary {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700;
}

.action-btn.tertiary {
  @apply text-white;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.action-btn.tertiary:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Animations */
@keyframes particle-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
}

@keyframes pack-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px) rotateZ(-5deg); }
  75% { transform: translateX(10px) rotateZ(5deg); }
}

@keyframes pack-explode {
  0% { transform: scale(1); }
  50% { transform: scale(1.2) rotateY(180deg); }
  100% { transform: scale(0) rotateY(360deg); opacity: 0; }
}

@keyframes card-fly {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(15deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

@keyframes card-appear {
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

@keyframes legendary-glow {
  from { box-shadow: 0 20px 60px rgba(251, 191, 36, 0.6); }
  to { box-shadow: 0 25px 80px rgba(251, 191, 36, 0.9); }
}

@keyframes legendary-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}
</style>
