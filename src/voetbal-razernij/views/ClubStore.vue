<template>
  <div class="club-store">
    <!-- Club Header -->
    <div class="club-header mb-8">
      <div class="club-banner" :style="{ '--club-color': club?.primaryColor || '#1976D2' }">
        <div class="club-badge-large">
          <span class="text-6xl">🏆</span>
        </div>
        <div class="club-info">
          <h1 class="club-name">{{ club?.name || 'Eredivisie Club' }}</h1>
          <p class="club-subtitle">Officiële Club Winkel</p>
        </div>
        <div class="club-stats">
          <div class="stat">
            <span class="stat-value">{{ clubProgress?.totalXP || 0 }}</span>
            <span class="stat-label">XP</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ clubProgress?.totalTokens || 0 }}</span>
            <span class="stat-label">🎟️ Tokens</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center">
      <div class="animate-spin text-6xl">⚽</div>
      <p class="text-white mt-4">Club winkel laden...</p>
    </div>

    <!-- Pack Store -->
    <div v-else class="pack-store">
      <h2 class="store-title">🎁 Spelerspakketten</h2>
      <p class="store-subtitle">
        Gebruik je {{ club?.name || 'club' }} tokens om pakketten te kopen en spelers te verzamelen!
      </p>

      <div class="packs-grid">
        <!-- Bronze Pack -->
        <div class="pack-card bronze" :class="{ 'available': isPackAvailable('bronze'), 'locked': !isPackAvailable('bronze') }">
          <div class="pack-header">
            <div class="pack-icon">🥉</div>
            <h3 class="pack-name">Bronze Pack</h3>
            <div class="pack-rarity">Basis pakket</div>
          </div>

          <div class="pack-contents">
            <div class="content-item">
              <span class="content-icon">🎴</span>
              <span>{{ BALANCE_CONFIG.packs.bronze.cardCount }} spelers</span>
            </div>
            <div class="content-item">
              <span class="content-icon">⭐</span>
              <span>60% gewone spelers</span>
            </div>
            <div class="content-item">
              <span class="content-icon">✨</span>
              <span>25% ongewone spelers</span>
            </div>
          </div>

          <div class="pack-cost">
            <span class="cost-amount">{{ BALANCE_CONFIG.packs.bronze.cost }}</span>
            <span class="cost-currency">🎟️</span>
          </div>

          <button
            @click="openPack('bronze')"
            :disabled="!canAffordPack('bronze')"
            class="pack-buy-btn"
            :class="{ 'affordable': canAffordPack('bronze') }"
          >
            {{ !isPackAvailable('bronze') ? '🔒 Vergrendeld' : !canAffordPack('bronze') ? '💰 Te duur' : '🎁 Kopen & Openen' }}
          </button>
        </div>

        <!-- Silver Pack -->
        <div class="pack-card silver" :class="{ 'available': isPackAvailable('silver'), 'locked': !isPackAvailable('silver') }">
          <div class="pack-header">
            <div class="pack-icon">🥈</div>
            <h3 class="pack-name">Silver Pack</h3>
            <div class="pack-rarity">Premium pakket</div>
          </div>

          <div class="pack-contents">
            <div class="content-item">
              <span class="content-icon">🎴</span>
              <span>{{ BALANCE_CONFIG.packs.silver.cardCount }} spelers</span>
            </div>
            <div class="content-item">
              <span class="content-icon">⭐</span>
              <span>50% gewone spelers</span>
            </div>
            <div class="content-item">
              <span class="content-icon">✨</span>
              <span>30% ongewone spelers</span>
            </div>
            <div class="content-item">
              <span class="content-icon">💎</span>
              <span>20% zeldzame spelers</span>
            </div>
          </div>

          <div class="pack-cost">
            <span class="cost-amount">{{ BALANCE_CONFIG.packs.silver.cost }}</span>
            <span class="cost-currency">🎟️</span>
          </div>

          <div v-if="!isPackAvailable('silver')" class="unlock-requirement">
            <span class="unlock-text">Ontgrendel met {{ BALANCE_CONFIG.packs.silver.unlockXP }} XP</span>
            <div class="unlock-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${Math.min(100, ((clubProgress?.totalXP || 0) / BALANCE_CONFIG.packs.silver.unlockXP) * 100)}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ clubProgress?.totalXP || 0 }} / {{ BALANCE_CONFIG.packs.silver.unlockXP }}</span>
            </div>
          </div>

          <button
            @click="openPack('silver')"
            :disabled="!canAffordPack('silver')"
            class="pack-buy-btn"
            :class="{ 'affordable': canAffordPack('silver') }"
          >
            {{ !isPackAvailable('silver') ? '🔒 Vergrendeld' : !canAffordPack('silver') ? '💰 Te duur' : '🎁 Kopen & Openen' }}
          </button>
        </div>

        <!-- Gold Pack -->
        <div class="pack-card gold" :class="{ 'available': isPackAvailable('gold'), 'locked': !isPackAvailable('gold') }">
          <div class="pack-header">
            <div class="pack-icon">🥇</div>
            <h3 class="pack-name">Gold Pack</h3>
            <div class="pack-rarity">Elite pakket</div>
          </div>

          <div class="pack-contents">
            <div class="content-item">
              <span class="content-icon">🎴</span>
              <span>{{ BALANCE_CONFIG.packs.gold.cardCount }} spelers</span>
            </div>
            <div class="content-item">
              <span class="content-icon">⭐</span>
              <span>30% gewone spelers</span>
            </div>
            <div class="content-item">
              <span class="content-icon">✨</span>
              <span>40% ongewone spelers</span>
            </div>
            <div class="content-item">
              <span class="content-icon">💎</span>
              <span>25% zeldzame spelers</span>
            </div>
            <div class="content-item">
              <span class="content-icon">🌟</span>
              <span>5% legendarische spelers</span>
            </div>
          </div>

          <div class="pack-cost">
            <span class="cost-amount">{{ BALANCE_CONFIG.packs.gold.cost }}</span>
            <span class="cost-currency">🎟️</span>
          </div>

          <div v-if="!isPackAvailable('gold')" class="unlock-requirement">
            <span class="unlock-text">Ontgrendel met {{ BALANCE_CONFIG.packs.gold.unlockXP }} XP</span>
            <div class="unlock-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${Math.min(100, ((clubProgress?.totalXP || 0) / BALANCE_CONFIG.packs.gold.unlockXP) * 100)}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ clubProgress?.totalXP || 0 }} / {{ BALANCE_CONFIG.packs.gold.unlockXP }}</span>
            </div>
          </div>

          <button
            @click="openPack('gold')"
            :disabled="!canAffordPack('gold')"
            class="pack-buy-btn"
            :class="{ 'affordable': canAffordPack('gold') }"
          >
            {{ !isPackAvailable('gold') ? '🔒 Vergrendeld' : !canAffordPack('gold') ? '💰 Te duur' : '🎁 Kopen & Openen' }}
          </button>
        </div>
      </div>

      <!-- Club Collection Preview -->
      <div class="club-collection-preview mt-12">
        <h3 class="preview-title">🎴 {{ club?.name || 'Club' }} Collectie</h3>
        <div class="collection-stats">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value">{{ clubPlayerCards.length }}</div>
            <div class="stat-label">Spelers verzameld</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💯</div>
            <div class="stat-value">{{ collectionCompletion }}%</div>
            <div class="stat-label">Volledigheid</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-value">{{ averageRating }}</div>
            <div class="stat-label">Gem. Rating</div>
          </div>
        </div>

        <!-- Quick Navigation -->
        <div class="quick-navigation">
          <button @click="viewFullCollection" class="nav-btn">
            📚 Volledige Collectie
          </button>
          <button @click="buildTeam" class="nav-btn">
            ⚽ Team Samenstellen
          </button>
          <button @click="backToTables" class="nav-btn">
            🏠 Tafels Oefenen
          </button>
        </div>

        <!-- Debug Panel (only visible in development mode) -->
        <div v-if="showDebugPanel" class="debug-panel">
          <h4 class="debug-title">🛠️ Debug Panel</h4>
          <div class="debug-controls">
            <div class="debug-section">
              <label class="debug-label">Tokens toevoegen:</label>
              <div class="debug-input-group">
                <input
                  v-model.number="debugTokenAmount"
                  type="number"
                  min="1"
                  max="10000"
                  class="debug-input"
                  placeholder="Aantal tokens"
                />
                <button @click="addDebugTokens" class="debug-btn">
                  ➕ Toevoegen
                </button>
              </div>
            </div>
            <div class="debug-section">
              <label class="debug-label">XP toevoegen:</label>
              <div class="debug-input-group">
                <input
                  v-model.number="debugXpAmount"
                  type="number"
                  min="1"
                  max="10000"
                  class="debug-input"
                  placeholder="Aantal XP"
                />
                <button @click="addDebugXp" class="debug-btn">
                  ⭐ Toevoegen
                </button>
              </div>
            </div>
            <div class="debug-section">
              <button @click="unlockAllPacks" class="debug-btn unlock-all">
                🔓 Alle Pakketten Ontgrendelen
              </button>
            </div>
          </div>
          <p class="debug-info">
            💡 Druk op Ctrl+Shift+D om dit panel te verbergen
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClubProgressStore, useCollectionStore } from '../stores';
import { FootballDataService } from '../utils/football-data';
import { BALANCE_CONFIG } from '../utils/balance-config';

const route = useRoute();
const router = useRouter();
const clubProgressStore = useClubProgressStore();
const collectionStore = useCollectionStore();

const clubId = ref<number>(parseInt(route.params.clubId as string));
const isLoading = ref(true);

// Debug state
const showDebugPanel = ref(false);
const debugTokenAmount = ref(100);
const debugXpAmount = ref(50);

// Computed
const club = computed(() => {
  if (!isLoading.value) {
    return FootballDataService.getClubById(clubId.value);
  }
  return null;
});
const clubProgress = computed(() => clubProgressStore.getClubProgress(clubId.value));

const clubPlayerCards = computed(() => {
  if (!isLoading.value) {
    return collectionStore.getPlayersByClub(clubId.value);
  }
  return [];
});

const collectionCompletion = computed(() => {
  if (isLoading.value || clubPlayerCards.value.length === 0) return 0;
  const totalClubPlayers = FootballDataService.getPlayersByClub(clubId.value).length;
  if (totalClubPlayers === 0) return 0;
  return Math.round((clubPlayerCards.value.length / totalClubPlayers) * 100);
});

const averageRating = computed(() => {
  if (isLoading.value || clubPlayerCards.value.length === 0) return 0;
  const totalRating = clubPlayerCards.value.reduce((sum, card) => sum + card.rating, 0);
  return Math.round(totalRating / clubPlayerCards.value.length);
});

// Methods
async function initializeData() {
  try {
    await FootballDataService.initialize();
    isLoading.value = false;
  } catch (error) {
    console.error('Failed to load club data:', error);
    isLoading.value = false;
  }
}

function isPackAvailable(packType: 'bronze' | 'silver' | 'gold'): boolean {
  return clubProgress.value.unlockedPacks.includes(packType);
}

function canAffordPack(packType: 'bronze' | 'silver' | 'gold'): boolean {
  if (!isPackAvailable(packType)) return false;
  const cost = BALANCE_CONFIG.packs[packType].cost;
  return (clubProgress.value?.totalTokens || 0) >= cost;
}

async function openPack(packType: 'bronze' | 'silver' | 'gold') {
  if (!canAffordPack(packType)) return;

  const cost = BALANCE_CONFIG.packs[packType].cost;
  const success = clubProgressStore.spendTokens(clubId.value, cost);

  if (success) {
    // Navigate to pack opening screen
    router.push({
      name: 'VoetbalPackOpening',
      params: {
        clubId: clubId.value.toString(),
        packType
      }
    });
  }
}

function viewFullCollection() {
  router.push({ name: 'VoetbalCollection' });
}

function buildTeam() {
  router.push({ name: 'VoetbalTeamBuilder' });
}

function backToTables() {
  router.push({ name: 'VoetbalTableSelect' });
}

// Debug functions
function addDebugTokens() {
  if (!debugTokenAmount.value || debugTokenAmount.value <= 0) return;

  const progress = clubProgressStore.getClubProgress(clubId.value);
  progress.totalTokens += debugTokenAmount.value;

  console.log(`Added ${debugTokenAmount.value} tokens to club ${clubId.value}`);
}

function addDebugXp() {
  if (!debugXpAmount.value || debugXpAmount.value <= 0) return;

  const progress = clubProgressStore.getClubProgress(clubId.value);
  progress.totalXP += debugXpAmount.value;

  // Check for pack unlocks
  const { packs } = BALANCE_CONFIG;
  const unlockedPacks = progress.unlockedPacks;

  if (
    progress.totalXP >= packs.silver.unlockXP &&
    !unlockedPacks.includes('silver')
  ) {
    progress.unlockedPacks.push('silver');
  }
  if (
    progress.totalXP >= packs.gold.unlockXP &&
    !unlockedPacks.includes('gold')
  ) {
    progress.unlockedPacks.push('gold');
  }

  console.log(`Added ${debugXpAmount.value} XP to club ${clubId.value}`);
}

function unlockAllPacks() {
  const progress = clubProgressStore.getClubProgress(clubId.value);
  progress.unlockedPacks = ['bronze', 'silver', 'gold'];
  console.log(`Unlocked all packs for club ${clubId.value}`);
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey && event.shiftKey && event.key === 'D') {
    event.preventDefault();
    showDebugPanel.value = !showDebugPanel.value;
  }
}

onMounted(() => {
  initializeData();
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
@reference "tailwindcss";

.club-banner {
  @apply bg-gradient-to-r text-white rounded-3xl p-8 flex items-center justify-between;
  background: linear-gradient(135deg, var(--club-color), rgba(0,0,0,0.2));
  box-shadow: 0 12px 48px var(--club-color);
}

.club-badge-large {
  @apply w-20 h-20 rounded-full flex items-center justify-center;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 20px rgba(255,255,255,0.3);
}

.club-name {
  @apply text-4xl font-black mb-2;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.club-subtitle {
  @apply text-xl opacity-90;
}

.club-stats {
  @apply flex gap-6;
}

.stat {
  @apply text-center;
}

.stat-value {
  @apply block text-2xl font-bold;
}

.stat-label {
  @apply text-sm opacity-80;
}

.store-title {
  @apply text-3xl font-bold text-white text-center mb-4;
}

.store-subtitle {
  @apply text-xl text-center mb-8;
  color: rgba(255, 255, 255, 0.9);
}

.packs-grid {
  @apply grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8;
}

.pack-card {
  @apply backdrop-blur-sm rounded-3xl p-6 border-2 transition-all duration-300;
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.pack-card.bronze {
  @apply border-yellow-600;
}

.pack-card.silver {
  @apply border-gray-400;
}

.pack-card.gold {
  @apply border-yellow-400;
}

.pack-card.available:hover {
  @apply transform scale-105;
  box-shadow: 0 12px 48px rgba(0,0,0,0.2);
}

.pack-card.locked {
  @apply opacity-60;
}

.pack-header {
  @apply text-center mb-6;
}

.pack-icon {
  @apply text-4xl mb-2;
}

.pack-name {
  @apply text-2xl font-bold text-white mb-1;
}

.pack-rarity {
  color: rgba(255, 255, 255, 0.8);
}

.pack-contents {
  @apply mb-6 space-y-2;
}

.content-item {
  @apply flex items-center gap-2;
  color: rgba(255, 255, 255, 0.9);
}

.content-icon {
  @apply text-lg;
}

.pack-cost {
  @apply text-center mb-6;
}

.cost-amount {
  @apply text-3xl font-bold text-white mr-2;
}

.cost-currency {
  @apply text-2xl;
}

.pack-buy-btn {
  @apply w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300;
}

.pack-buy-btn.affordable {
  @apply bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105;
}

.pack-buy-btn:not(.affordable) {
  @apply text-gray-300 cursor-not-allowed;
  background-color: rgba(107, 114, 128, 0.5);
}

.unlock-requirement {
  @apply mb-4 p-4 rounded-xl text-center;
  background-color: rgba(0, 0, 0, 0.2);
}

.unlock-text {
  @apply block mb-2;
  color: rgba(255, 255, 255, 0.9);
}

.progress-bar {
  @apply w-full rounded-full h-2 overflow-hidden mb-1;
  background-color: rgba(255, 255, 255, 0.2);
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500;
}

.progress-text {
  @apply text-xs;
  color: rgba(255, 255, 255, 0.8);
}

.club-collection-preview {
  @apply backdrop-blur-sm rounded-3xl p-8;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-title {
  @apply text-2xl font-bold text-white text-center mb-6;
}

.collection-stats {
  @apply grid grid-cols-3 gap-6 mb-8;
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

.quick-navigation {
  @apply flex flex-wrap gap-4 justify-center;
}

.nav-btn {
  @apply px-6 py-3 text-white rounded-xl transition-all duration-300 font-medium;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Debug Panel Styles */
.debug-panel {
  @apply mt-8 p-6 rounded-xl border-2 border-dashed border-yellow-400;
  background: linear-gradient(135deg, rgba(255, 255, 0, 0.1), rgba(255, 165, 0, 0.1));
  backdrop-filter: blur(10px);
}

.debug-title {
  @apply text-xl font-bold text-yellow-300 mb-4 text-center;
}

.debug-controls {
  @apply space-y-4;
}

.debug-section {
  @apply flex flex-col gap-2;
}

.debug-label {
  @apply text-white font-medium;
}

.debug-input-group {
  @apply flex gap-2;
}

.debug-input {
  @apply px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur-sm;
  width: 200px;
}

.debug-input:focus {
  @apply outline-none border-yellow-400 bg-white/20;
}

.debug-btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.8));
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-btn:hover {
  @apply transform scale-105;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.debug-btn.unlock-all {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(139, 69, 219, 0.8));
}

.debug-btn.unlock-all:hover {
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.debug-info {
  @apply text-center text-sm text-yellow-200 mt-4 opacity-80;
}
</style>
