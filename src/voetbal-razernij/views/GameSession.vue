<template>
  <div class="game-session">
    <!-- Session Header -->
    <div class="session-header mb-6">
      <div
        class="flex items-center justify-between backdrop-blur-sm rounded-2xl p-4"
        style="
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        "
      >
        <!-- Club Info -->
        <div class="flex items-center gap-4">
          <div
            class="club-badge"
            :style="{ '--club-color': club?.primaryColor || '#1976D2' }"
          >
            <img
              v-if="club?.id"
              :src="getClubLogoUrl(club.id)"
              :alt="`${club.name} logo`"
              class="club-logo"
            />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white">
              {{ club?.name || "Eredivisie" }}
            </h2>
            <p style="color: rgba(255, 255, 255, 0.8)">
              Tafel van {{ table }} • Sessie {{ sessionMinutes }} minuten
            </p>
          </div>
        </div>

        <!-- Timer -->
        <div class="timer" :class="{ 'timer-warning': timeRemaining < 60 }">
          <div class="timer-icon">⏱️</div>
          <div class="timer-display">{{ formatTime(timeRemaining) }}</div>
        </div>

        <!-- Exit Button -->
        <button @click="confirmExit" class="exit-btn">❌</button>
      </div>
    </div>

    <!-- Game Area -->
    <div v-if="currentSession" class="game-area">
      <!-- Question Display -->
      <div class="question-section mb-6">
        <div class="question-card">
          <!-- Question -->
          <div class="question-display">
            <span class="text-5xl md:text-7xl font-black text-gray-800">
              {{ currentQuestion.factor1 }} × {{ currentQuestion.factor2 }}
            </span>
          </div>

          <!-- Input Area -->
          <div class="answer-section mt-6">
            <input
              ref="answerInput"
              v-model="userAnswer"
              @keyup.enter="submitAnswer"
              type="number"
              class="answer-input"
              placeholder="?"
              :disabled="isAnswerFeedbackShowing"
            />
            <button
              @click="submitAnswer"
              class="submit-btn"
              :disabled="!userAnswer || isAnswerFeedbackShowing"
            >
              ✓ Antwoord
            </button>
          </div>

          <!-- Answer Feedback -->
          <div
            v-if="isAnswerFeedbackShowing"
            class="answer-feedback"
            :class="{
              correct: lastAnswerCorrect,
              incorrect: !lastAnswerCorrect,
            }"
          >
            <div class="feedback-icon">
              <span v-if="lastAnswerCorrect" class="text-4xl">✅</span>
              <span v-else class="text-4xl">❌</span>
            </div>
            <div class="feedback-text">
              <span v-if="lastAnswerCorrect" class="text-xl font-bold"
                >Goed!</span
              >
              <span v-else class="text-xl font-bold"
                >Het juiste antwoord was {{ correctAnswer }}</span
              >
            </div>
            <div class="rewards-earned">
              <span class="reward">+{{ lastRewards.coins }} 🪙</span>
              <span class="reward">+{{ lastRewards.xp }} XP</span>
              <span v-if="lastRewards.tokens > 0" class="reward special"
                >+{{ lastRewards.tokens }} 🎟️</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Game Stats -->
      <div class="game-stats">
        <div class="stats-grid">
          <!-- Score -->
          <div class="stat-item">
            <div class="stat-icon">💰</div>
            <div class="stat-value">{{ currentSession.coinsEarned }}</div>
            <div class="stat-label">Coins</div>
          </div>

          <!-- Streak -->
          <div
            class="stat-item"
            :class="{ 'stat-hot': currentSession.currentStreak >= 3 }"
          >
            <div class="stat-icon">🔥</div>
            <div class="stat-value">{{ currentSession.currentStreak }}</div>
            <div class="stat-label">Streak</div>
          </div>

          <!-- Questions -->
          <div class="stat-item">
            <div class="stat-icon">❓</div>
            <div class="stat-value">{{ currentSession.questionsAnswered }}</div>
            <div class="stat-label">Vragen</div>
          </div>

          <!-- Accuracy -->
          <div class="stat-item">
            <div class="stat-icon">📊</div>
            <div class="stat-value">{{ Math.round(accuracy) }}%</div>
            <div class="stat-label">Score</div>
          </div>

          <!-- Club Tokens -->
          <div class="stat-item special">
            <div class="stat-icon">🎟️</div>
            <div class="stat-value">{{ currentSession.tokensEarned }}</div>
            <div class="stat-label">Tokens</div>
          </div>
        </div>
      </div>

      <!-- Motivation Messages -->
      <div v-if="showMotivation" class="motivation-banner">
        <div class="motivation-content">
          <span class="text-2xl">{{ motivationMessage.icon }}</span>
          <span class="font-bold">{{ motivationMessage.text }}</span>
        </div>
      </div>

      <!-- Helper Hint (after 2 consecutive wrong answers) -->
      <div v-if="showHint" class="helper-hint">
        <h4 class="font-bold mb-2">💡 Hulp bij tafel van {{ table }}:</h4>
        <p>{{ hintText }}</p>
        <button @click="dismissHint" class="dismiss-btn">Begrepen!</button>
      </div>
    </div>

    <!-- Session End Modal -->
    <div v-if="showSessionEnd" class="session-end-modal">
      <div class="modal-backdrop" @click="closeSessionEnd"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-3xl font-bold">🎉 Sessie Voltooid!</h2>
          <p class="text-lg text-gray-600">
            {{ club?.name || "Eredivisie" }} • Tafel van {{ table }}
          </p>
        </div>

        <div class="session-results">
          <!-- Performance Stats -->
          <div class="results-section">
            <h3 class="section-title">📈 Resultaten</h3>
            <div class="results-grid">
              <div class="result-item">
                <span class="result-label">Vragen beantwoord:</span>
                <span class="result-value">{{
                  sessionResults?.questionsAnswered || 0
                }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Correct:</span>
                <span class="result-value correct">{{
                  sessionResults?.correctAnswers || 0
                }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Fout:</span>
                <span class="result-value incorrect">{{
                  sessionResults?.incorrectAnswers || 0
                }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Beste streak:</span>
                <span class="result-value">{{
                  sessionResults?.bestStreak || 0
                }}</span>
              </div>
            </div>
          </div>

          <!-- Rewards Earned -->
          <div class="results-section">
            <h3 class="section-title">🎁 Beloningen</h3>
            <div class="rewards-grid">
              <div class="reward-item">
                <span class="text-2xl">🪙</span>
                <span class="reward-amount">{{
                  sessionResults?.coinsEarned || 0
                }}</span>
                <span class="reward-type">Coins</span>
              </div>
              <div class="reward-item">
                <span class="text-2xl">⭐</span>
                <span class="reward-amount">{{
                  sessionResults?.xpEarned || 0
                }}</span>
                <span class="reward-type">XP</span>
              </div>
              <div class="reward-item">
                <span class="text-2xl">🎟️</span>
                <span class="reward-amount">{{
                  sessionResults?.tokensEarned || 0
                }}</span>
                <span class="reward-type">Club Tokens</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button @click="playAgain" class="action-btn primary">
            🔄 Nogmaals Spelen
          </button>
          <button
            @click="openClubStore"
            class="action-btn secondary"
            :disabled="!club"
          >
            🏪 Club Winkel
          </button>
          <button @click="backToSelection" class="action-btn tertiary">
            🏠 Tafel Kiezen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  inject,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useVoetbalGameStore } from "../stores";
import { FootballDataService } from "../utils/football-data";
import { BALANCE_CONFIG } from "../utils/balance-config";

const route = useRoute();
const router = useRouter();
const gameStore = useVoetbalGameStore();
const isDataInitialized = inject("isDataInitialized", ref(false));

// Props
const table = ref<number>(parseInt(route.params.table as string) || 1);

// Refs
const answerInput = ref<HTMLInputElement>();
const userAnswer = ref<string>("");
const currentQuestion = ref({ factor1: table.value, factor2: 1 });
const correctAnswer = ref<number>(0);
const lastAnswerCorrect = ref<boolean>(false);
const isAnswerFeedbackShowing = ref<boolean>(false);
const lastRewards = ref({ coins: 0, xp: 0, tokens: 0 });
const consecutiveWrong = ref<number>(0);
const showHint = ref<boolean>(false);
const showMotivation = ref<boolean>(false);
const motivationMessage = ref({ icon: "", text: "" });
const showSessionEnd = ref<boolean>(false);
const sessionResults = ref<any>(null);

// Session timer
let sessionTimer: ReturnType<typeof setInterval> | null = null;
let motivationTimer: ReturnType<typeof setTimeout> | null = null;

// Computed
const currentSession = computed(() => gameStore.currentSession);
const timeRemaining = computed(() =>
  Math.max(0, gameStore.sessionTimeRemaining),
);
const sessionMinutes = computed(() => BALANCE_CONFIG.session.durationMinutes);
const accuracy = computed(() => {
  if (!currentSession.value || currentSession.value.questionsAnswered === 0)
    return 0;
  return (
    (currentSession.value.correctAnswers /
      currentSession.value.questionsAnswered) *
    100
  );
});

const club = computed(() => {
  if (!currentSession.value) return null;
  return FootballDataService.getClubById(currentSession.value.clubId);
});

const hintText = computed(() => {
  const hints = [
    `Tafel van ${table.value}: Tel in stapjes van ${table.value}! (${table.value}, ${table.value * 2}, ${table.value * 3}, ...)`,
    `Tips: ${table.value} × 2 = ${table.value * 2}, ${table.value} × 5 = ${table.value * 5}, ${table.value} × 10 = ${table.value * 10}`,
    `Gebruik je vingers! Tel ${table.value} keer het getal bij elkaar op.`,
  ];
  return hints[Math.floor(Math.random() * hints.length)];
});

function getClubLogoUrl(clubId: number): string {
  return `https://cdn.soccerwiki.org/images/logos/clubs/${clubId}.png`;
}

// Lifecycle
onMounted(async () => {
  // Wait for data initialization from parent
  if (!isDataInitialized.value) {
    const unwatch = watch(isDataInitialized, (initialized) => {
      if (initialized) {
        startSession();
        setupSessionTimer();
        generateNewQuestion();

        // Focus input
        nextTick(() => {
          answerInput.value?.focus();
        });
        unwatch();
      }
    });
  } else {
    startSession();
    setupSessionTimer();
    generateNewQuestion();

    // Focus input
    nextTick(() => {
      answerInput.value?.focus();
    });
  }
});

onUnmounted(() => {
  cleanupTimers();
});

// Watch for session end
watch(timeRemaining, (newTime) => {
  if (newTime <= 0 && currentSession.value?.isActive) {
    endSession();
  }
});

// Methods
function startSession() {
  try {
    gameStore.startSession(table.value);
  } catch (error) {
    console.error("Failed to start session:", error);
    router.push({ name: "VoetbalTableSelect" });
  }
}

function generateNewQuestion() {
  const factor2 = Math.floor(Math.random() * 12) + 1; // 1-12
  currentQuestion.value = {
    factor1: table.value,
    factor2: factor2,
  };
  correctAnswer.value = table.value * factor2;
  userAnswer.value = "";

  // Focus input after feedback
  if (!isAnswerFeedbackShowing.value) {
    nextTick(() => {
      answerInput.value?.focus();
    });
  }
}

function submitAnswer() {
  if (!userAnswer.value || isAnswerFeedbackShowing.value) return;

  const answer = parseInt(userAnswer.value);
  const isCorrect = answer === correctAnswer.value;

  // Track previous rewards for display
  const prevCoins = currentSession.value?.coinsEarned || 0;
  const prevTokens = currentSession.value?.tokensEarned || 0;

  // Submit answer to store
  gameStore.answerQuestion(isCorrect);

  // Calculate rewards earned this question
  lastRewards.value = {
    coins: (currentSession.value?.coinsEarned || 0) - prevCoins,
    xp: isCorrect
      ? BALANCE_CONFIG.scoring.correctAnswerXP
      : BALANCE_CONFIG.scoring.incorrectAnswerXP,
    tokens: (currentSession.value?.tokensEarned || 0) - prevTokens,
  };

  // Handle feedback
  lastAnswerCorrect.value = isCorrect;
  isAnswerFeedbackShowing.value = true;

  // Handle consecutive wrong answers for hints
  if (isCorrect) {
    consecutiveWrong.value = 0;
    showHint.value = false;
    showMotivationMessage("🎉", "Goed gedaan!");
  } else {
    consecutiveWrong.value++;
    if (consecutiveWrong.value >= 2) {
      showHint.value = true;
    }
  }

  // Auto-advance after feedback
  setTimeout(() => {
    isAnswerFeedbackShowing.value = false;
    generateNewQuestion();
  }, 2000);
}

function showMotivationMessage(icon: string, text: string) {
  motivationMessage.value = { icon, text };
  showMotivation.value = true;

  clearTimeout(motivationTimer!);
  motivationTimer = setTimeout(() => {
    showMotivation.value = false;
  }, 3000);
}

function dismissHint() {
  showHint.value = false;
  consecutiveWrong.value = 0;
}

function setupSessionTimer() {
  sessionTimer = setInterval(() => {
    // Timer is handled by the store's computed property
    if (timeRemaining.value <= 0) {
      endSession();
    }
  }, 1000);
}

function cleanupTimers() {
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
  if (motivationTimer) {
    clearTimeout(motivationTimer);
    motivationTimer = null;
  }
}

function endSession() {
  const results = gameStore.endSession();
  if (results) {
    sessionResults.value = results;
    showSessionEnd.value = true;
    cleanupTimers();
  }
}

function confirmExit() {
  if (confirm("Weet je zeker dat je de sessie wilt beëindigen?")) {
    endSession();
  }
}

function closeSessionEnd() {
  showSessionEnd.value = false;
  router.push({ name: "VoetbalTableSelect" });
}

function playAgain() {
  showSessionEnd.value = false;
  startSession();
  setupSessionTimer();
  generateNewQuestion();
}

function openClubStore() {
  if (club.value && club.value.id) {
    router.push({
      name: "VoetbalClubStore",
      params: { clubId: club.value.id },
    });
  } else {
    console.error("Club niet beschikbaar voor ClubStore navigatie");
    // Fallback: ga terug naar tafel selectie
    router.push({ name: "VoetbalTableSelect" });
  }
}

function backToSelection() {
  showSessionEnd.value = false;
  router.push({ name: "VoetbalTableSelect" });
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
</script>

<style scoped>
@reference "tailwindcss";

.session-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.club-badge {
  @apply w-12 h-12 rounded-full flex items-center justify-center;
  background: var(--club-color, #1976d2);
  box-shadow: 0 4px 16px var(--club-color);
}

.timer {
  @apply text-center text-white;
}

.timer-warning {
  @apply animate-pulse;
  color: #ff4444;
}

.timer-icon {
  @apply text-2xl mb-1;
}

.timer-display {
  @apply text-3xl font-black font-mono;
}

.exit-btn {
  @apply px-4 py-2 text-white rounded-lg transition-all;
  background-color: rgba(239, 68, 68, 0.2);
}
.exit-btn:hover {
  background-color: rgba(239, 68, 68, 0.4);
}

.question-card {
  @apply backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.question-display {
  @apply mb-6;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.answer-input {
  @apply w-32 h-20 text-4xl font-black text-center bg-white border-4 border-blue-300 rounded-2xl mr-4 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200;
}

.submit-btn {
  @apply px-8 py-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105;
}

.answer-feedback {
  @apply mt-6 p-4 rounded-2xl animate-bounce;
}

.answer-feedback.correct {
  @apply bg-green-100 border-2 border-green-400;
}

.answer-feedback.incorrect {
  @apply bg-red-100 border-2 border-red-400;
}

.rewards-earned {
  @apply flex justify-center gap-4 mt-2;
}

.reward {
  @apply px-3 py-1 bg-yellow-200 rounded-full text-sm font-bold text-yellow-800;
}

.reward.special {
  @apply bg-purple-200 text-purple-800 animate-pulse;
}

.stats-grid {
  @apply grid grid-cols-5 gap-4;
}

.stat-item {
  @apply backdrop-blur-sm rounded-xl p-4 text-center text-white;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item.stat-hot {
  @apply border-orange-400;
  background-color: rgba(249, 115, 22, 0.2);
  animation: pulse 1s infinite;
}

.stat-item.special {
  @apply border-purple-400;
  background-color: rgba(168, 85, 247, 0.2);
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

.motivation-banner {
  @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-2xl;
  animation: motivation-appear 0.5s ease-out;
}

.motivation-content {
  @apply flex items-center gap-4 px-8 py-4 text-xl font-bold;
}

.helper-hint {
  @apply bg-blue-100 border-2 border-blue-300 rounded-2xl p-6 text-blue-800 mt-6;
}

.dismiss-btn {
  @apply mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all;
}

.session-end-modal {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4;
}

.modal-backdrop {
  @apply absolute inset-0 backdrop-blur-sm;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  @apply relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto;
  animation: modal-appear 0.3s ease-out;
}

.modal-header {
  @apply text-center p-6 border-b border-gray-200;
}

.session-results {
  @apply p-6;
}

.results-section {
  @apply mb-6;
}

.section-title {
  @apply text-xl font-bold mb-4 text-gray-700;
}

.results-grid {
  @apply grid grid-cols-2 gap-4;
}

.result-item {
  @apply flex justify-between items-center p-3 bg-gray-50 rounded-lg;
}

.result-value.correct {
  @apply text-green-600 font-bold;
}

.result-value.incorrect {
  @apply text-red-600 font-bold;
}

.rewards-grid {
  @apply grid grid-cols-3 gap-4;
}

.reward-item {
  @apply text-center p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl;
}

.reward-amount {
  @apply block text-2xl font-bold text-gray-800;
}

.reward-type {
  @apply text-sm text-gray-600;
}

.modal-actions {
  @apply flex flex-wrap gap-3 p-6 border-t border-gray-200;
}

.action-btn {
  @apply flex-1 px-6 py-3 font-bold rounded-xl transition-all transform hover:scale-105;
}

.action-btn.primary {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700;
}

.action-btn.secondary {
  @apply bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700;
}

.action-btn.tertiary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

@keyframes motivation-appear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
