<template>
  <div class="table-select-screen">
    <!-- Welcome Section -->
    <div class="text-center mb-8">
      <div class="animate-bounce mb-4">
        <span class="text-8xl">⚽</span>
      </div>
      <h2 class="text-3xl font-bold text-white mb-4">
        Kies een tafel om te oefenen!
      </h2>
      <p class="text-xl mb-6" style="color: rgba(255, 255, 255, 0.9);">
        Elke tafel is gekoppeld aan een Eredivisie club. Verdien XP en tokens voor je favoriete teams!
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center">
      <div class="animate-spin text-6xl">⚽</div>
      <p class="text-white mt-4">Laden van clubs...</p>
    </div>

    <!-- Table Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto mb-8">
      <div
        v-for="table in tables"
        :key="table.number"
        class="table-card group cursor-pointer"
        @click="selectTable(table.number)"
        :style="{ '--club-color': table.club?.primaryColor || '#1976D2' }"
      >
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
            <span class="font-bold">{{ table.club?.shortName || 'ERE' }}</span>
          </div>
          <div class="club-full-name text-xs opacity-75 mt-1">
            {{ table.club?.name || 'Eredivisie' }}
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-section mt-3">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${table.progress}%` }"
            ></div>
          </div>
          <div class="progress-stats flex justify-between text-xs mt-1">
            <span>{{ table.clubProgress?.totalXP || 0 }} XP</span>
            <span>{{ table.clubProgress?.totalTokens || 0 }} 🪙</span>
          </div>
        </div>

        <!-- Unlock Status -->
        <div class="unlock-status flex justify-center gap-1 mt-2">
          <div
            v-for="pack in ['bronze', 'silver', 'gold']"
            :key="pack"
            class="unlock-indicator"
            :class="{
              'unlocked': table.clubProgress?.unlockedPacks.includes(pack),
              [pack]: true
            }"
          >
            <span v-if="pack === 'bronze'">🥉</span>
            <span v-if="pack === 'silver'">🥈</span>
            <span v-if="pack === 'gold'">🥇</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="table-actions mt-3">
          <button
            @click.stop="openClubStore(table.club?.id)"
            class="club-store-btn-small"
            :disabled="!table.club"
          >
            🏪
          </button>
        </div>

        <!-- Hover Effect -->
        <div class="table-hover-overlay">
          <span class="text-2xl">🎯</span>
          <span class="font-bold">Start Sessie!</span>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats max-w-4xl mx-auto">
      <h3 class="text-2xl font-bold text-white text-center mb-6">📊 Jouw Voortgang</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="stat-icon">🎮</div>
          <div class="stat-value">{{ gameStore.globalStats.totalGamesPlayed }}</div>
          <div class="stat-label">Sessies</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❓</div>
          <div class="stat-value">{{ gameStore.globalStats.totalQuestionsAnswered }}</div>
          <div class="stat-label">Vragen</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">{{ gameStore.globalStats.totalCorrectAnswers }}</div>
          <div class="stat-label">Correct</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-value">{{ gameStore.globalStats.bestOverallStreak }}</div>
          <div class="stat-label">Beste Streak</div>
        </div>
      </div>
    </div>

    <!-- Club Store Button -->
    <div class="text-center mt-8">
      <button
        @click="openClubStores"
        class="club-store-btn"
      >
        🏪 Club Winkels
        <span class="ml-2 text-sm opacity-75">(Bekijk alle clubs)</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVoetbalGameStore, useClubProgressStore } from '../stores';
import { FootballDataService } from '../utils/football-data';
import { TABLE_TO_CLUB_MAPPING } from '../utils/balance-config';

const router = useRouter();
const gameStore = useVoetbalGameStore();
const clubProgressStore = useClubProgressStore();

const isLoading = ref(true);

interface TableInfo {
  number: number;
  club?: {
    id: number;
    name: string;
    shortName: string;
    primaryColor: string;
  };
  progress: number;
  clubProgress?: any;
}

const tables = computed<TableInfo[]>(() => {
  const tableList: TableInfo[] = [];

  for (let i = 1; i <= 10; i++) {
    const clubId = TABLE_TO_CLUB_MAPPING[i];
    const club = clubId ? FootballDataService.getClubById(clubId) : undefined;
    const clubProgress = clubId ? clubProgressStore.getClubProgress(clubId) : undefined;

    // Calculate progress percentage (0-100% based on XP)
    let progress = 0;
    if (clubProgress && clubProgress.totalXP > 0) {
      // Simple progress calculation - could be more sophisticated
      progress = Math.min(100, (clubProgress.totalXP / 200) * 100);
    }

    tableList.push({
      number: i,
      club,
      progress,
      clubProgress,
    });
  }

  return tableList;
});

async function initializeData() {
  try {
    await FootballDataService.initialize();
    isLoading.value = false;
  } catch (error) {
    console.error('Failed to load football data:', error);
    isLoading.value = false;
  }
}

function selectTable(tableNumber: number) {
  // Check if there's already an active session
  if (gameStore.isSessionActive) {
    if (confirm('Er is al een actieve sessie. Wil je deze beëindigen en een nieuwe starten?')) {
      gameStore.endSession();
    } else {
      return;
    }
  }

  router.push({ name: 'VoetbalGame', params: { table: tableNumber.toString() } });
}

function openClubStores() {
  router.push({ name: 'VoetbalCollection' });
}

function openClubStore(clubId?: number) {
  if (!clubId) return;
  router.push({ 
    name: 'VoetbalClubStore', 
    params: { clubId: clubId.toString() } 
  });
}

onMounted(() => {
  initializeData();
});
</script>

<style scoped>
@reference "tailwindcss";

.table-card {
  @apply relative backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:scale-105;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--club-color, #1976D2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.table-card:hover {
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

.progress-bar {
  @apply w-full rounded-full h-2 overflow-hidden;
  background-color: rgba(255, 255, 255, 0.2);
}

.progress-fill {
  @apply h-full rounded-full transition-all duration-500;
  background: linear-gradient(90deg, var(--club-color), #FFD700);
}

.progress-stats {
  color: rgba(255, 255, 255, 0.8);
}

.unlock-indicator {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-30 transition-all;
}

.unlock-indicator.unlocked {
  @apply opacity-100 scale-110;
  filter: drop-shadow(0 0 8px currentColor);
}

.unlock-indicator.bronze.unlocked {
  @apply text-yellow-600;
}

.unlock-indicator.silver.unlocked {
  @apply text-gray-400;
}

.unlock-indicator.gold.unlocked {
  @apply text-yellow-400;
}

.table-hover-overlay {
  @apply absolute inset-0 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-gray-800;
  background-color: rgba(255, 255, 255, 0.9);
}

.stat-card {
  @apply backdrop-blur-sm rounded-xl p-4 text-center;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-icon {
  @apply text-2xl mb-2;
}

.stat-value {
  @apply text-2xl font-bold text-white mb-1;
}

.stat-label {
  @apply text-sm;
  color: rgba(255, 255, 255, 0.8);
}

.club-store-btn {
  @apply px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-2xl;
}

.quick-stats {
  @apply backdrop-blur-sm rounded-2xl p-6;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.table-actions {
  @apply flex justify-center;
}

.club-store-btn-small {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.club-store-btn-small:hover:not(:disabled) {
  @apply transform scale-110;
  background-color: rgba(255, 255, 255, 0.2);
}

.club-store-btn-small:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
