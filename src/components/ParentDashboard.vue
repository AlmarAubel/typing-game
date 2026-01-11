<template>
  <div class="max-w-6xl mx-auto p-8 bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">👨‍👩‍👧‍👦 Ouder Dashboard</h1>
      <p class="text-gray-600">Overzicht van de voortgang en prestaties van je kind</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow text-center">
        <div class="text-2xl font-bold text-blue-600">{{ progressSummary.overallAccuracy }}%</div>
        <div class="text-sm text-gray-600">Gemiddelde accuratie</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow text-center">
        <div class="text-2xl font-bold text-green-600">{{ progressSummary.totalTablesPracticed }}/10</div>
        <div class="text-sm text-gray-600">Tafels geoefend</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow text-center">
        <div class="text-2xl font-bold text-purple-600">{{ progressSummary.recentSessions }}</div>
        <div class="text-sm text-gray-600">Sessies deze week</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow text-center">
        <div class="text-2xl font-bold text-yellow-600">{{ progressSummary.achievements }}</div>
        <div class="text-sm text-gray-600">Behaalde badges</div>
      </div>
    </div>

    <!-- Tables Performance -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Tables that need practice -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-4 text-red-600">📚 Tafels die extra oefening nodig hebben</h2>
        <div v-if="tablesNeedingPractice.length > 0" class="space-y-3">
          <div
            v-for="tablestat in tablesNeedingPractice"
            :key="`${tablestat.table}-${tablestat.operation}`"
            class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
          >
            <div>
              <span class="font-semibold">Tafel van {{ tablestat.table }}</span>
              <span class="text-sm text-gray-600 ml-2">({{ tablestat.operation }})</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-red-600">{{ tablestat.difficultyScore }}% score</div>
              <div class="text-xs text-gray-500">
                {{ tablestat.correctAttempts }}/{{ tablestat.totalAttempts }} correct
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-600 text-center py-4">
          🎉 Alle tafels gaan goed! Blijf oefenen.
        </div>
      </div>

      <!-- Recent performance -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-4 text-green-600">📈 Recente prestaties</h2>
        <div v-if="analytics.weeklyProgress.length > 0">
          <div class="space-y-3">
            <div
              v-for="session in recentSessions"
              :key="session.startTime.getTime()"
              class="flex items-center justify-between p-3 bg-green-50 rounded-lg"
            >
              <div>
                <div class="font-semibold">{{ formatDate(session.startTime) }}</div>
                <div class="text-sm text-gray-600">{{ session.gameMode }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold">
                  {{ Math.round((session.correctAnswers / session.totalProblems) * 100) }}% correct
                </div>
                <div class="text-xs text-gray-500">
                  {{ session.totalPoints }} punten - {{ formatDuration(session) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-600 text-center py-4">
          Nog geen sessies voltooid
        </div>
      </div>
    </div>

    <!-- Detailed table analysis -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-bold mb-4 text-gray-800">🎯 Gedetailleerde tafel analyse</h2>

      <!-- Table performance grid -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          v-for="table in [1,2,3,4,5,6,7,8,9,10]"
          :key="table"
          :class="[
            'p-4 rounded-lg text-center border-2',
            getTablePerformanceClass(table)
          ]"
        >
          <div class="text-lg font-bold">{{ table }}</div>
          <div class="text-sm">
            {{ getTableStats(table)?.totalAttempts || 0 }} pogingen
          </div>
          <div class="text-xs">
            {{ getTableAccuracy(table) }}% juist
          </div>
          <div class="text-xs text-gray-600">
            {{ getLastPracticed(table) }}
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-4 flex flex-wrap gap-4 text-sm">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-green-100 border-2 border-green-400 rounded mr-2"></div>
          <span>Goed (≥80%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded mr-2"></div>
          <span>Gemiddeld (60-79%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-red-100 border-2 border-red-400 rounded mr-2"></div>
          <span>Needs practice (&lt;60%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded mr-2"></div>
          <span>Not practiced</span>
        </div>
      </div>
    </div>

    <!-- Achievements -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-bold mb-4 text-purple-600">🏆 Behaalde badges</h2>
      <div v-if="analytics.achievements.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="achievement in analytics.achievements"
          :key="achievement.id"
          class="p-4 bg-purple-50 rounded-lg text-center"
        >
          <div class="text-2xl mb-2">{{ achievement.icon }}</div>
          <div class="font-semibold text-sm">{{ achievement.name }}</div>
          <div class="text-xs text-gray-600">{{ achievement.description }}</div>
          <div class="text-xs text-purple-600 mt-1">
            {{ formatDate(achievement.unlockedAt) }}
          </div>
        </div>
      </div>
      <div v-else class="text-gray-600 text-center py-4">
        Nog geen badges behaald. Blijf oefenen!
      </div>
    </div>

    <!-- Recommendations -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-bold mb-4 text-blue-600">💡 Aanbevelingen</h2>
      <div class="space-y-4">
        <div v-if="analytics.recommendations.tablesToPractice.length > 0" class="p-4 bg-blue-50 rounded-lg">
          <h3 class="font-semibold text-blue-800 mb-2">Focus op deze tafels:</h3>
          <p class="text-blue-700">
            Tafel van {{ analytics.recommendations.tablesToPractice.join(', ') }}
          </p>
        </div>

        <div class="p-4 bg-green-50 rounded-lg">
          <h3 class="font-semibold text-green-800 mb-2">Aanbevolen moeilijkheidsgraad:</h3>
          <p class="text-green-700 capitalize">
            {{ analytics.recommendations.suggestedDifficulty }} niveau
          </p>
        </div>

        <div class="p-4 bg-yellow-50 rounded-lg">
          <h3 class="font-semibold text-yellow-800 mb-2">Optimale sessie duur:</h3>
          <p class="text-yellow-700">
            Ongeveer {{ analytics.recommendations.optimalSessionLength }} minuten
          </p>
        </div>
      </div>
    </div>

    <!-- Game state import/export -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-bold mb-2 text-indigo-600">🔁 Game state import/export</h2>
      <p class="text-sm text-gray-600 mb-4">
        Download alle gespeelde data (analytics, pokemon stores en voetbalprogressie) of laad een opgeslagen JSON-bestand opnieuw in.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isExporting"
          @click="exportGameState"
        >
          📤 Export Game State
        </button>
        <button
          type="button"
          class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isImporting"
          @click="triggerImport"
        >
          📥 Import Game State
        </button>
      </div>
      <input
        ref="importFileInput"
        type="file"
        accept="application/json"
        class="hidden"
        @change="handleImportFile"
      />
      <p
        v-if="gameStateMessage"
        :class="[
          'text-sm mt-4',
          gameStateMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
        ]"
      >
        {{ gameStateMessage.text }}
      </p>
    </div>

    <!-- Action buttons -->
    <div class="mt-8 text-center space-x-4">

      <button
        @click="exportData"
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        📊 Export Data
      </button>
      <button
        @click="resetAnalytics"
        class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        🗑️ Reset Analytics
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { parentAnalytics, type ParentAnalytics } from '../utils/parentAnalytics';
import { useGameStateBackup } from '../composables/useGameStateBackup';

const analytics = ref<ParentAnalytics>({
  tableStats: {},
  weeklyProgress: [],
  achievements: [],
  preferences: {
    preferredDifficulty: 'medium',
    favoriteOperations: ['multiplication'],
    averageSessionTime: 10
  },
  recommendations: {
    tablesToPractice: [],
    suggestedDifficulty: 'medium',
    optimalSessionLength: 10
  }
});

const progressSummary = ref({
  overallAccuracy: 0,
  totalTablesPracticed: 0,
  recentSessions: 0,
  averageSessionTime: 0,
  achievements: 0,
  recommendedPractice: [] as any[]
});

const loadAnalytics = () => {
  console.log('Loading analytics...');
  analytics.value = parentAnalytics.getDetailedAnalytics();
  progressSummary.value = parentAnalytics.getProgressSummary();
  console.log('Analytics loaded:', analytics.value);
  console.log('Progress summary:', progressSummary.value);
  console.log('Recent sessions:', analytics.value.weeklyProgress);
};

onMounted(() => {
  loadAnalytics();
});

const {
  importFileInput,
  isExporting,
  isImporting,
  gameStateMessage,
  exportGameState,
  triggerImport,
  handleImportFile,
} = useGameStateBackup({
  onImportSuccess: () => loadAnalytics(),
});

// Computed properties
const tablesNeedingPractice = computed(() => {
  return parentAnalytics.getTablesNeedingPractice(5);
});

const recentSessions = computed(() => {
  return analytics.value.weeklyProgress.slice(-5).reverse();
});

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('nl-NL', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatDuration = (session: any) => {
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  const minutes = Math.round((end.getTime() - start.getTime()) / 1000 / 60);
  return `${minutes} min`;
};

const getTableStats = (table: number) => {
  return analytics.value.tableStats[`${table}-multiplication`];
};

const getTableAccuracy = (table: number) => {
  const stats = getTableStats(table);
  if (!stats || stats.totalAttempts === 0) return 0;
  return Math.round((stats.correctAttempts / stats.totalAttempts) * 100);
};

const getLastPracticed = (table: number) => {
  const stats = getTableStats(table);
  if (!stats) return 'Nooit';

  const days = Math.floor((Date.now() - new Date(stats.lastPracticed).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Vandaag';
  if (days === 1) return 'Gisteren';
  return `${days} dagen geleden`;
};

const getTablePerformanceClass = (table: number) => {
  const accuracy = getTableAccuracy(table);
  const stats = getTableStats(table);

  if (!stats || stats.totalAttempts === 0) {
    return 'bg-gray-100 border-gray-300 text-gray-600';
  }

  if (accuracy >= 80) {
    return 'bg-green-100 border-green-400 text-green-800';
  } else if (accuracy >= 60) {
    return 'bg-yellow-100 border-yellow-400 text-yellow-800';
  } else {
    return 'bg-red-100 border-red-400 text-red-800';
  }
};

const exportData = () => {
  const data = {
    analytics: analytics.value,
    progressSummary: progressSummary.value,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `typegame-analytics-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const resetAnalytics = () => {
  if (confirm('Weet je zeker dat je alle analytics wilt resetten? Dit kan niet ongedaan gemaakt worden.')) {
    parentAnalytics.resetAnalytics();
    loadAnalytics();
  }
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
