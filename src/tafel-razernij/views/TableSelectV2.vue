<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSharedPokemonStore, GameType } from "../../stores/sharedPokemonStore";
import { parentAnalytics } from "../../utils/parentAnalytics";

const router = useRouter();
const pokemonStore = useSharedPokemonStore();

// Game settings
const practiceType = ref("open");
const isRandom = ref(true);
const difficultyLevel = ref("medium");
const enableBonusPoints = ref(true);

// Table selection
const tables = Array.from({ length: 10 }, (_, i) => i + 1);
const selectedTables = ref<number[]>([]);

// Analytics and recommendations
const analytics = ref(parentAnalytics.getProgressSummary());
const recommendedTables = ref<number[]>([]);

onMounted(async () => {
  await pokemonStore.init();
  analytics.value = parentAnalytics.getProgressSummary();
  recommendedTables.value = parentAnalytics.getTablesNeedingPractice(3).map(stat => stat.table);
});

// Computed properties
const pointsDisplay = computed(() => pokemonStore.state.points);
const currentStreak = computed(() => pokemonStore.state.gameStats[GameType.TAFEL_RAZERNIJ_V2].currentStreak);
const streakRecord = computed(() => pokemonStore.state.gameStats[GameType.TAFEL_RAZERNIJ_V2].streakRecord);

const difficultyMultiplier = computed(() => {
  switch (difficultyLevel.value) {
    case 'easy': return 1;
    case 'medium': return 1.2;
    case 'hard': return 1.5;
    default: return 1.2;
  }
});

const estimatedPointsPerCorrect = computed(() => {
  const basePoints = 10;
  const difficulty = difficultyMultiplier.value;
  return Math.round(basePoints * difficulty + (enableBonusPoints.value ? 5 : 0));
});

// Table selection methods
const selectTable = (table: number) => {
  const index = selectedTables.value.indexOf(table);
  if (index === -1) {
    selectedTables.value.push(table);
  } else {
    selectedTables.value.splice(index, 1);
  }
};

const selectAllTables = () => {
  selectedTables.value = [...tables];
};

const selectRecommended = () => {
  selectedTables.value = [...recommendedTables.value];
};

const clearSelection = () => {
  selectedTables.value = [];
};

const isTableRecommended = (table: number) => {
  return recommendedTables.value.includes(table);
};

const getTableAccuracy = (table: number) => {
  const tableStats = parentAnalytics.getDetailedAnalytics().tableStats;
  const stat = tableStats[`${table}-multiplication`];
  if (!stat || stat.totalAttempts === 0) return null;
  return Math.round((stat.correctAttempts / stat.totalAttempts) * 100);
};

// Game start
const startGame = () => {
  if (selectedTables.value.length === 0) return;

  // Reset current streak for new game session
  pokemonStore.resetStreak();

  router.push({
    name: "tafel-game-v2",
    params: { table: selectedTables.value.join(",") },
    query: {
      type: practiceType.value,
      random: isRandom.value ? "1" : "0",
      difficulty: difficultyLevel.value,
      bonusPoints: enableBonusPoints.value ? "1" : "0",
    },
  });
};
</script>

<template>
  <div class="max-w-6xl mx-auto p-8 font-roboto">
    <!-- Header with stats -->
    <div class="text-center mb-8">
      <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
        Tafel Razernij V2 🚀
      </h2>
      <div class="flex justify-center space-x-6 text-sm">
        <div class="bg-yellow-100 px-4 py-2 rounded-lg">
          <span class="text-yellow-800 font-semibold">💰 {{ pointsDisplay }} punten</span>
        </div>
        <div class="bg-blue-100 px-4 py-2 rounded-lg">
          <span class="text-blue-800 font-semibold">🔥 Huidige streak: {{ currentStreak }}</span>
        </div>
        <div class="bg-purple-100 px-4 py-2 rounded-lg">
          <span class="text-purple-800 font-semibold">🏆 Record streak: {{ streakRecord }}</span>
        </div>
      </div>
    </div>

    <!-- Game Settings -->
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h3 class="text-xl font-bold mb-4 text-gray-800">Spel Instellingen</h3>

      <!-- Practice Type -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <label
          :class="[
            'flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200',
            practiceType === 'multiple-choice'
              ? 'bg-purple-100 border-2 border-purple-500 shadow-md'
              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100',
          ]"
        >
          <input
            type="radio"
            v-model="practiceType"
            value="multiple-choice"
            class="hidden"
          />
          <div class="flex items-center justify-between w-full">
            <span class="flex items-center space-x-3">
              <span class="text-2xl">🎯</span>
              <span class="font-medium">Multiple Choice</span>
            </span>
            <span
              :class="[
                'w-4 h-4 rounded-full border-2',
                practiceType === 'multiple-choice'
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300',
              ]"
            ></span>
          </div>
        </label>

        <label
          :class="[
            'flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200',
            practiceType === 'open'
              ? 'bg-purple-100 border-2 border-purple-500 shadow-md'
              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100',
          ]"
        >
          <input
            type="radio"
            v-model="practiceType"
            value="open"
            class="hidden"
          />
          <div class="flex items-center justify-between w-full">
            <span class="flex items-center space-x-3">
              <span class="text-2xl">✏️</span>
              <span class="font-medium">Vrij Invullen</span>
            </span>
            <span
              :class="[
                'w-4 h-4 rounded-full border-2',
                practiceType === 'open'
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300',
              ]"
            ></span>
          </div>
        </label>
      </div>

      <!-- Difficulty Level -->
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-3 text-gray-800">Moeilijkheidsgraad</h4>
        <div class="grid grid-cols-3 gap-4">
          <label
            v-for="level in ['easy', 'medium', 'hard']"
            :key="level"
            :class="[
              'flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all duration-200',
              difficultyLevel === level
                ? 'bg-green-100 border-2 border-green-500 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100',
            ]"
          >
            <input
              type="radio"
              v-model="difficultyLevel"
              :value="level"
              class="hidden"
            />
            <span class="text-2xl mb-2">
              {{ level === 'easy' ? '😊' : level === 'medium' ? '😐' : '😤' }}
            </span>
            <span class="font-medium capitalize">{{ level === 'easy' ? 'Makkelijk' : level === 'medium' ? 'Normaal' : 'Moeilijk' }}</span>
            <span class="text-sm text-gray-600">{{ level === 'easy' ? '1x punten' : level === 'medium' ? '1.2x punten' : '1.5x punten' }}</span>
          </label>
        </div>
      </div>

      <!-- Additional Options -->
      <div class="flex flex-wrap gap-4">
        <label class="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer">
          <input
            type="checkbox"
            v-model="isRandom"
            class="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-2"
          />
          <span class="font-medium text-gray-700">🔀 Door elkaar</span>
        </label>

        <label class="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer">
          <input
            type="checkbox"
            v-model="enableBonusPoints"
            class="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-2"
          />
          <span class="font-medium text-gray-700">⭐ Bonus Punten (streak & snelheid)</span>
        </label>
      </div>

      <!-- Points Preview -->
      <div class="mt-4 p-4 bg-yellow-50 rounded-xl">
        <div class="text-center">
          <span class="text-sm text-gray-600">Geschatte punten per correct antwoord: </span>
          <span class="font-bold text-yellow-800">{{ estimatedPointsPerCorrect }} punten</span>
        </div>
      </div>
    </div>

    <!-- Table Selection Helpers -->
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-gray-800">Tafel Selectie</h3>
        <div class="flex space-x-2">
          <button
            @click="selectRecommended"
            class="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
          >
            🎯 Aanbevolen ({{ recommendedTables.length }})
          </button>
          <button
            @click="selectAllTables"
            class="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            Alle Tafels
          </button>
          <button
            @click="clearSelection"
            class="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Wissen
          </button>
        </div>
      </div>

      <!-- Recommended Tables Info -->
      <div v-if="recommendedTables.length > 0" class="mb-4 p-4 bg-orange-50 rounded-xl">
        <div class="flex items-center space-x-2 text-orange-800">
          <span class="text-xl">💡</span>
          <span class="font-medium">Aanbevolen tafels om extra te oefenen:</span>
          <span class="font-bold">{{ recommendedTables.join(', ') }}</span>
        </div>
      </div>
    </div>

    <!-- Table Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      <button
        v-for="table in tables"
        :key="table"
        @click="selectTable(table)"
        :class="[
          'rounded-xl p-4 transition-all duration-200 shadow-md hover:shadow-lg flex flex-col items-center justify-center transform hover:-translate-y-1',
          selectedTables.includes(table)
            ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white scale-105'
            : isTableRecommended(table)
              ? 'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-900 border-2 border-orange-400'
              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300',
        ]"
      >
        <div class="flex items-center space-x-1 mb-2">
          <span class="text-2xl font-bold">{{ table }}</span>
          <span v-if="isTableRecommended(table)" class="text-lg">💡</span>
        </div>
        <span class="text-sm mb-1">Tafel van {{ table }}</span>

        <!-- Accuracy indicator -->
        <div v-if="getTableAccuracy(table) !== null" class="text-xs">
          <span
            :class="[
              'px-2 py-1 rounded-full',
              getTableAccuracy(table)! >= 80 ? 'bg-green-200 text-green-800' :
              getTableAccuracy(table)! >= 60 ? 'bg-yellow-200 text-yellow-800' :
              'bg-red-200 text-red-800'
            ]"
          >
            {{ getTableAccuracy(table) }}% juist
          </span>
        </div>
      </button>
    </div>

    <!-- Start Button -->
    <div class="text-center">
      <button
        @click="startGame"
        :disabled="selectedTables.length === 0"
        class="px-12 py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl text-xl font-bold hover:from-purple-600 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        🚀 Start V2 Oefening
        <span v-if="selectedTables.length > 0" class="block text-sm mt-1">
          {{ selectedTables.length }} {{ selectedTables.length === 1 ? 'tafel' : 'tafels' }} geselecteerd
        </span>
      </button>

      <!-- Back to V1 option -->
      <div class="mt-4">
        <router-link
          to="/tafel-razernij"
          class="text-gray-600 hover:text-purple-600 transition-colors text-sm underline"
        >
          ← Terug naar klassieke versie
        </router-link>
      </div>
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
</style>
