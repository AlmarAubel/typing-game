<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSharedPokemonStore, GameType } from "../../stores/sharedPokemonStore";
import { parentAnalytics } from "../../utils/parentAnalytics";

type PracticeType = "open" | "multiple-choice";
type Difficulty = "easy" | "medium" | "hard";

const route = useRoute();
const router = useRouter();
const pokemonStore = useSharedPokemonStore();

// Game settings from route
const practiceType: PracticeType = (route.query.type as PracticeType) || "open"; // standaard vrij invullen
const isRandom = route.query.random === undefined ? true : route.query.random === "1"; // standaard door elkaar
const difficulty: Difficulty = (route.query.difficulty as Difficulty) || "medium";
const bonusPointsEnabled = route.query.bonusPoints === "1";

// Game state
const answer = ref("");
const currentNumber = ref(1);
const currentTable = ref(1);
const questionStartTime = ref(Date.now());
const sessionId = ref("");

// Performance tracking
const sessionStats = ref({
  totalProblems: 0,
  correctAnswers: 0,
  totalPoints: 0,
  responseTimes: [] as number[],
  tablesUsed: new Set<number>()
});

// Visual state
const isAnimating = ref(false);
const isWrongAnswer = ref(false);
const showPointsAnimation = ref(false);
const lastPointsEarned = ref(0);

// Game container and input refs
const gameContainer = ref<HTMLElement | null>(null);
const answerInput = ref<HTMLInputElement | null>(null);



// Computed properties
const selectedTables = computed(() => {
  const tableParam = route.params.table as string;
  return tableParam.split(",").map((t) => parseInt(t));
});

const correctAnswer = computed(() => currentTable.value * currentNumber.value);

const options = computed(() => {
  if (practiceType === 'open') return [];
  return generateOptions(correctAnswer.value);
});

const currentStreak = computed(() =>
  pokemonStore.state.gameStats[GameType.TAFEL_RAZERNIJ_V2].currentStreak
);

const pointsDisplay = computed(() => pokemonStore.state.points);

const difficultyMultiplier = computed(() => {
  switch (difficulty) {
    case 'easy': return 1;
    case 'medium': return 1.2;
    case 'hard': return 1.5;
    default: return 1.2;
  }
});

// Improved weighted random table selection
const tableWeights = ref(new Map<number, number>());

function initializeTableWeights() {
  // Initialize equal weights, but lower weights for tables that were answered correctly recently
  selectedTables.value.forEach(table => {
    const analytics = parentAnalytics.getDetailedAnalytics();
    const tableStats = analytics.tableStats[`${table}-multiplication`];

    // Higher weight = more likely to be selected
    // Tables with lower accuracy get higher weight (need more practice)
    let weight = 1.0;

    if (tableStats && tableStats.totalAttempts > 0) {
      const accuracy = tableStats.correctAttempts / tableStats.totalAttempts;
      weight = Math.max(0.1, 1.2 - accuracy); // Range: 0.1 to 1.2

      // Boost weight for tables that haven't been practiced recently
      const daysSinceLastPractice = (Date.now() - new Date(tableStats.lastPracticed).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastPractice > 2) {
        weight *= 1.5;
      }
    }

    tableWeights.value.set(table, weight);
  });
}

function getWeightedRandomTable(): number {
  if (selectedTables.value.length === 1) return selectedTables.value[0];

  const weights = Array.from(tableWeights.value.values());
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;

  let accumulatedWeight = 0;
  for (const [table, weight] of tableWeights.value) {
    accumulatedWeight += weight;
    if (random <= accumulatedWeight) {
      return table;
    }
  }

  return selectedTables.value[0]; // fallback
}

// Game mechanics
function generateOptions(answer: number): number[] {
  const opts = [answer];
  const range = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;

  while (opts.length < 4) {
    const offset = Math.floor(Math.random() * range * 2) - range;
    const randomOpt = answer + offset;
    if (!opts.includes(randomOpt) && randomOpt > 0 && randomOpt <= 144) { // Max 12x12
      opts.push(randomOpt);
    }
  }

  return opts.sort(() => Math.random() - 0.5);
}



function calculatePoints(responseTime: number, isCorrect: boolean): number {
  if (!isCorrect) return 0;

  let points = 10; // Base points

  // Difficulty multiplier
  points *= difficultyMultiplier.value;

  if (bonusPointsEnabled) {
    // Streak bonus (up to 5 extra points)
    const streakBonus = Math.min(currentStreak.value * 1, 5);
    points += streakBonus;

    // Speed bonus (up to 3 points for answers under 3 seconds)
    if (responseTime < 3000) {
      const speedBonus = Math.round(3 - (responseTime / 1000));
      points += Math.max(0, speedBonus);
    }
  }

  return Math.round(points);
}

function getNextProblem() {
  if (isRandom) {
    // Smart randomization with weighted selection
    currentTable.value = getWeightedRandomTable();
    currentNumber.value = Math.floor(Math.random() * 10) + 1;
  } else {
    // Sequential progression
    if (currentNumber.value >= 10) {
      currentNumber.value = 1;
      const currentIndex = selectedTables.value.indexOf(currentTable.value);
      const nextIndex = (currentIndex + 1) % selectedTables.value.length;
      currentTable.value = selectedTables.value[nextIndex];
    } else {
      currentNumber.value++;
    }
  }

  // Update table weight (make it slightly less likely to appear next)
  if (isRandom && tableWeights.value.has(currentTable.value)) {
    const currentWeight = tableWeights.value.get(currentTable.value)!;
    tableWeights.value.set(currentTable.value, currentWeight * 0.9);
  }
}

function showPointsGained(points: number) {
  if (points > 0) {
    lastPointsEarned.value = points;
    showPointsAnimation.value = true;
    setTimeout(() => {
      showPointsAnimation.value = false;
    }, 2000);
  }
}

const checkAnswer = async (userAnswer: number | string, _event?: MouseEvent | null) => {
  if (isAnimating.value) return;

  const responseTime = Date.now() - questionStartTime.value;
  const numericAnswer = Number(userAnswer);
  const isCorrect = numericAnswer === correctAnswer.value;

  // Record analytics
  parentAnalytics.recordAttempt(currentTable.value, 'multiplication', isCorrect, responseTime);

  // Update session stats
  sessionStats.value.totalProblems++;
  sessionStats.value.responseTimes.push(responseTime);
  sessionStats.value.tablesUsed.add(currentTable.value);

  if (isCorrect) {
    sessionStats.value.correctAnswers++;
  }

  // Calculate and award points
  const pointsEarned = calculatePoints(responseTime, isCorrect);
  if (pointsEarned > 0) {
    sessionStats.value.totalPoints += pointsEarned;
    showPointsGained(pointsEarned);
  }

  // Record game result in store
  pokemonStore.recordGameResult(GameType.TAFEL_RAZERNIJ_V2, isCorrect, pointsEarned);

  // Show immediate feedback without pokeball animation
  if (isCorrect) {
    // Correct answer - continue to next problem
    getNextProblem();
    questionStartTime.value = Date.now();

    if (practiceType === "open") {
      answer.value = "";
      setTimeout(() => answerInput.value?.focus(), 0);
    }
  } else {
    // Wrong answer - show feedback and continue
    isWrongAnswer.value = true;
    setTimeout(() => {
      isWrongAnswer.value = false;
    }, 500);

    questionStartTime.value = Date.now();
    if (practiceType === "open") {
      answer.value = "";
      setTimeout(() => answerInput.value?.focus(), 0);
    }
  }
};



const endGame = () => {
  if (sessionId.value) {
    const avgTime = sessionStats.value.responseTimes.length > 0
      ? sessionStats.value.responseTimes.reduce((a, b) => a + b, 0) / sessionStats.value.responseTimes.length
      : 0;

    const endResults = {
      totalProblems: sessionStats.value.totalProblems,
      correctAnswers: sessionStats.value.correctAnswers,
      totalPoints: sessionStats.value.totalPoints,
      averageTime: avgTime,
      tablesUsed: Array.from(sessionStats.value.tablesUsed)
    };

    console.log('Ending session with results:', endResults);
    parentAnalytics.endSession(sessionId.value, endResults);
  }
  router.push('/tafel-razernij/v2');
};

// Lifecycle
onMounted(async () => {
  await pokemonStore.init();
  initializeTableWeights();

  currentTable.value = selectedTables.value[0];
  sessionId.value = parentAnalytics.startSession(practiceType === 'open' ? 'open-input' : practiceType as 'multiple-choice');
  questionStartTime.value = Date.now();

  if (practiceType === "open") {
    setTimeout(() => answerInput.value?.focus(), 100);
  }
});

onUnmounted(() => {
  endGame();
});

// Watch for route changes to end session
watch(() => route.path, () => {
  if (!route.path.includes('tafel-razernij/v2/game')) {
    endGame();
  }
});
</script>

<template>
  <div class="h-[100svh] flex flex-col overflow-hidden">
    <!-- Main Game Area -->
    <div class="flex flex-col p-4 md:p-6 overflow-hidden">
      <!-- Enhanced Stats Bar -->
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 shadow-lg">
        <div class="flex justify-between items-center text-white">
          <div class="flex space-x-8">
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold">💰 {{ pointsDisplay }}</div>
              <div class="text-sm opacity-80">Punten</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold">🔥 {{ currentStreak }}</div>
              <div class="text-sm opacity-80">Streak</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold">✓ {{ sessionStats.correctAnswers }}</div>
              <div class="text-sm opacity-80">Goed</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold">📊 {{ sessionStats.totalProblems }}</div>
              <div class="text-sm opacity-80">Totaal</div>
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              @click="endGame"
              class="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors font-semibold"
            >
              ← Stop
            </button>
          </div>
        </div>
      </div>

      <div ref="gameContainer" class="relative flex-1 bg-gray-100 rounded-xl p-8 md:p-12 min-h-0 flex flex-col justify-center">
        <!-- Top Bar -->
        <div class="flex justify-between items-center mb-12">
          <div class="text-6xl md:text-8xl font-bold text-indigo-700">
            {{ currentNumber }} × {{ currentTable }} = ?
            <span v-if="difficulty !== 'medium'" class="text-2xl md:text-3xl text-gray-600 ml-4 block mt-4">
              ({{ difficulty === 'easy' ? 'Makkelijk' : 'Moeilijk' }})
            </span>
          </div>
          <!-- Enhanced Stats Display -->
          <div class="text-right">
            <div class="text-5xl md:text-6xl font-bold text-yellow-500 mb-2">💰 {{ pointsDisplay }}</div>
            <div class="text-lg text-gray-600">punten</div>
          </div>
        </div>

        <!-- Points Animation & Feedback -->
        <div v-if="showPointsAnimation" class="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-50">
          <div class="bg-yellow-400 rounded-full p-8 md:p-12 text-center animate-bounce shadow-2xl border-4 border-yellow-500">
            <div class="text-6xl md:text-8xl font-bold text-white drop-shadow-lg">
              +{{ lastPointsEarned }}
            </div>
            <div class="text-2xl md:text-3xl font-semibold text-yellow-900 mt-4">
              PUNTEN!
            </div>
            <div v-if="currentStreak > 1" class="text-lg md:text-xl text-orange-700 mt-2">
              🔥 {{ currentStreak }}x streak!
            </div>
          </div>
        </div>

        <!-- Wrong Answer Feedback -->
        <div v-if="isWrongAnswer" class="absolute inset-0 flex items-center justify-center z-40">
          <div class="bg-red-500 text-white px-12 py-8 rounded-xl text-4xl md:text-5xl font-bold animate-shake shadow-2xl">
            ❌ Probeer opnieuw!
          </div>
        </div>



        <!-- Answer Interface -->
        <div class="mt-auto mb-8">
          <!-- Multiple Choice -->
          <template v-if="practiceType === 'multiple-choice'">
            <div class="grid grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
              <button
                v-for="option in options"
                :key="option"
                @click="(e: MouseEvent) => checkAnswer(option, e)"
                :disabled="isAnimating"
                class="px-8 py-6 md:px-12 md:py-8 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-3xl md:text-4xl font-bold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {{ option }}
              </button>
            </div>
          </template>

          <!-- Open Input -->
          <template v-else>
            <div class="flex justify-center items-center space-x-4 md:space-x-8 max-w-2xl mx-auto">
              <input
                ref="answerInput"
                type="number"
                inputmode="numeric"
                pattern="[0-9]*"
                v-model="answer"
                @keyup.enter="checkAnswer(answer, null)"
                :disabled="isAnimating"
                placeholder="Type je antwoord..."
                class="flex-1 px-6 py-6 md:px-8 md:py-8 text-2xl md:text-3xl border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500 focus:border-purple-500 text-center font-bold shadow-lg"
              />
              <button
                @click="(e: MouseEvent) => checkAnswer(answer, e)"
                :disabled="isAnimating"
                class="submit-button px-8 py-6 md:px-12 md:py-8 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-2xl md:text-3xl font-bold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✓
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

* {
  font-family: "Roboto", sans-serif;
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Enhanced gradient background */
.bg-gray-100 {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%);
}
</style>
