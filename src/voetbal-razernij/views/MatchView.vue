<template>
  <div
    class="match-view relative min-h-screen text-white overflow-hidden bg-green-900"
  >
    <!-- Stadium Ambience Background handled by CSS or overlay -->
    <div
      class="stadium-overlay absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
      style="background-image: url(&quot;/assets/stadium-bg.jpg&quot;)"
    ></div>

    <!-- Match Header (Scoreboard) -->
    <div class="relative z-10 p-4">
      <div
        class="scoreboard mx-auto max-w-4xl bg-black/60 backdrop-blur rounded-xl p-4 flex justify-between items-center border-b-4 border-yellow-400"
      >
        <!-- Player Team -->
        <div class="team-block flex flex-col items-center w-1/3">
          <div class="flex items-center gap-2 mb-2">
            <h2 class="text-xl font-bold text-yellow-300">
              {{ playerTeamName }}
            </h2>
          </div>
          <div class="text-4xl font-black">{{ battle?.playerScore || 0 }}</div>
        </div>

        <!-- Match Time -->
        <div class="time-block flex flex-col items-center w-1/3">
          <div
            class="bg-red-600 px-4 py-1 rounded text-lg font-mono font-bold shadow-lg"
          >
            {{ battle?.matchMinutes || 0 }}'
          </div>
          <div
            class="mt-2 text-sm font-bold uppercase tracking-widest text-yellow-400 animate-pulse"
          >
            {{
              battle?.possession === "player" ? "JOUW BALBEZIT" : "TEGENAANVAL!"
            }}
          </div>
        </div>

        <!-- Opponent Team -->
        <div class="team-block flex flex-col items-center w-1/3">
          <div class="flex items-center gap-2 mb-2">
            <img
              v-if="opponentClubLogo"
              :src="opponentClubLogo"
              :alt="opponentClubName"
              class="w-8 h-8 object-contain"
            />
            <h2 class="text-xl font-bold text-gray-300">
              {{ opponentClubName }}
            </h2>
          </div>
          <div class="text-4xl font-black">
            {{ battle?.opponentScore || 0 }}
          </div>
        </div>
      </div>

      <!-- Tournament Medals Hud -->
      <div
        v-if="isTournamentMatch"
        class="absolute top-2 right-4 flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-full font-bold shadow-lg animate-fade-in-down"
      >
        <span>{{ matchMedals }}</span>
        <span class="text-xl">🥇</span>
      </div>
    </div>

    <!-- Medal Feedback (Floating) - Top Right -->
    <div
      v-if="medalFeedback"
      class="fixed top-24 right-8 z-50 pointer-events-none animate-fade-in-down"
    >
      <div
        class="text-3xl md:text-4xl font-black text-yellow-300 drop-shadow-lg text-center bg-black/80 backdrop-blur px-6 py-3 rounded-2xl border-2 border-yellow-400"
        style="text-shadow: 0 4px 0 #b45309"
      >
        {{ medalFeedback }}
      </div>
    </div>

    <!-- Action Feedback (Fixed Position) -->
    <div
      v-if="lastMessage"
      class="fixed top-32 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none animate-bounce"
    >
      <span
        class="text-2xl md:text-3xl font-black bg-white text-black px-6 py-2 rounded-full shadow-xl inline-block transform rotate-2"
      >
        {{ lastMessage }}
      </span>
    </div>

    <!-- Main Pitch Action -->
    <div
      class="relative z-10 container mx-auto px-4 mt-8 flex flex-col items-center"
    >
      <!-- Math Game Interface -->
      <div
        class="game-interface bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative overflow-hidden"
        :class="{
          'border-4 border-green-400': answerFeedback === 'correct',
          'border-4 border-red-500': answerFeedback === 'incorrect',
          'border border-white/20': !answerFeedback,
        }"
      >
        <!-- Situation Indicator -->
        <div
          class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r"
          :class="
            battle?.possession === 'player'
              ? 'from-green-400 to-green-600'
              : 'from-red-500 to-red-600'
          "
        ></div>

        <h3 class="text-center text-xl mb-6 font-bold uppercase opacity-80">
          {{
            battle?.possession === "player"
              ? "⚽️ Schiet op doel!"
              : "🛡️ Verdedig!"
          }}
        </h3>

        <div
          class="question text-center mb-8 flex items-center justify-center gap-4"
        >
          <span class="text-6xl md:text-8xl font-black drop-shadow-lg">
            {{ currentQuestion.factor1 }} × {{ currentQuestion.factor2 }}
          </span>
          <!-- Answer Feedback -->
          <span
            v-if="answerFeedback"
            class="text-6xl md:text-8xl animate-bounce"
          >
            <span v-if="answerFeedback === 'correct'" class="text-green-400"
              >✓</span
            >
            <span v-else class="text-red-500">✗</span>
          </span>
        </div>

        <div class="controls flex gap-4 justify-center">
          <input
            ref="answerInput"
            v-model="userAnswer"
            type="number"
            placeholder="?"
            class="w-32 text-center text-4xl bg-black/40 border-2 border-white/50 rounded-xl p-4 focus:outline-none focus:border-yellow-400 transition-colors"
            @keyup.enter="handleAnswer"
            :disabled="isProcessing"
          />
          <button
            @click="handleAnswer"
            class="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl px-8 py-3 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!userAnswer || isProcessing"
          >
            {{ battle?.possession === "player" ? "SCHIET!!" : "BLOKKEER!!" }}
          </button>
        </div>
      </div>

      <!-- Commentary / Log -->
      <div
        class="match-log mt-8 w-full max-w-2xl bg-black/40 rounded-xl p-4 h-32 overflow-y-auto"
      >
        <div
          v-for="(log, idx) in battle?.history.slice().reverse()"
          :key="idx"
          class="text-sm py-1 border-b border-white/10 last:border-0 opacity-80"
        >
          > {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useVoetbalGameStore, useTeamStore } from "../stores";
import { useTournamentStore } from "../stores/tournament";
import { useStaffStore } from "../stores/staff";
import { useMathGame } from "../composables/useMathGame";
import { calculateMovePower, resolveRound } from "../utils/battle-mechanics";
import { BALANCE_CONFIG } from "../utils/balance-config";
import { FootballDataService } from "../utils/football-data";

const router = useRouter();
const gameStore = useVoetbalGameStore();
const teamStore = useTeamStore();
const tournamentStore = useTournamentStore();
const staffStore = useStaffStore();
const { currentQuestion, generateNewQuestion, userAnswer, correctAnswer } =
  useMathGame();

const answerInput = ref<HTMLInputElement>();
const lastMessage = ref<string>("");
const answerFeedback = ref<"correct" | "incorrect" | null>(null);
const isProcessing = ref(false);
const questionStartTime = ref(Date.now());

// Match State
const battle = computed(() => gameStore.currentBattle);
const isTournamentMatch = computed(
  () => tournamentStore.tournament && tournamentStore.tournament.isActive,
);

// Medal & Streak Logic
const matchMedals = ref(0);
const matchStreak = ref(0);
const medalFeedback = ref<string | null>(null);

// Staff Abilities
const secondChanceUsed = ref(false);
const hasKeeperCoach = computed(() => staffStore.hasStaff("keeper_coach"));
const hasAnalyst = computed(() => staffStore.hasStaff("analyst"));

// Team & Club Info
const playerTeamName = computed(() => {
  if (isTournamentMatch.value && tournamentStore.tournament) {
    return tournamentStore.tournament.playerTeamName;
  }
  return teamStore.currentTeam?.name || "Jouw Team";
});

const opponentClubId = computed(() => battle.value?.opponentClubId || null);

const opponentClub = computed(() => {
  if (!opponentClubId.value) return null;
  return FootballDataService.getClubById(opponentClubId.value);
});

const opponentClubName = computed(
  () => opponentClub.value?.name || "Tegenstander",
);
const opponentClubLogo = computed(() => opponentClub.value?.badge || null);

onMounted(() => {
  if (!gameStore.currentBattle || !gameStore.currentBattle.isActive) {
    // Redirect if no active battle
    console.warn("No active battle found");
    router.push("/voetbal-razernij");
    return;
  }

  startRound();
});

function startRound() {
  isProcessing.value = false;
  lastMessage.value = "";
  answerFeedback.value = null;
  medalFeedback.value = null;
  userAnswer.value = "";

  // Use tables from battle session
  const tables = battle.value?.activeTables || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  generateNewQuestion(tables);
  questionStartTime.value = Date.now();

  nextTick(() => {
    answerInput.value?.focus();
  });
}

function handleAnswer() {
  if (isProcessing.value || !battle.value) return;

  const thinkingTime = (Date.now() - questionStartTime.value) / 1000;
  // Analyst Bonus: Deduct 5 seconds from thinking time (making the shot more powerful)
  const adjustedTime = hasAnalyst.value
    ? Math.max(0.1, thinkingTime - 5)
    : thinkingTime;

  const isCorrect = parseInt(userAnswer.value) === correctAnswer.value;

  // Keeper Trainer: Second Chance Logic
  if (!isCorrect && hasKeeperCoach.value && !secondChanceUsed.value) {
    secondChanceUsed.value = true;
    lastMessage.value = "🧤 KEEPERSTRAINER: Tweede kans! Probeer het opnieuw!";
    userAnswer.value = "";
    answerInput.value?.focus();
    // Flash effect
    answerFeedback.value = "incorrect";
    setTimeout(() => {
      answerFeedback.value = null;
    }, 500);
    return;
  }

  // Set visual feedback
  answerFeedback.value = isCorrect ? "correct" : "incorrect";
  isProcessing.value = true;

  // Medal Logic (Tournament Only)
  if (isTournamentMatch.value) {
    if (isCorrect) {
      matchStreak.value++;
      let gained = BALANCE_CONFIG.medals.correctAnswer;
      let bonusMsg = "";

      // Streak Bonuses
      if (matchStreak.value === 3) {
        gained += BALANCE_CONFIG.medals.streakBonus[3];
        bonusMsg = "🔥 STREAK!";
      } else if (matchStreak.value === 5) {
        gained += BALANCE_CONFIG.medals.streakBonus[5];
        bonusMsg = "🔥🔥 ON FIRE!";
      } else if (matchStreak.value % 10 === 0) {
        gained += BALANCE_CONFIG.medals.streakBonus[10];
        bonusMsg = "⚡️ LEGENDARISCH!";
      }

      tournamentStore.addMedals(gained);
      matchMedals.value += gained;
      medalFeedback.value = `+${gained} 🥇 ${bonusMsg}`;
    } else {
      matchStreak.value = 0;
    }
  }

  // 1. Calculate Power
  // Use team from TeamBuilder if available, otherwise fallback
  const myTeam = teamStore.currentTeam;
  const myRating = myTeam && myTeam.totalRating > 0 ? myTeam.totalRating : 75;
  const oppRating = 70;

  const power = calculateMovePower(myRating, adjustedTime, isCorrect);

  // 2. Resolve Round
  // Map store possession ('player'|'opponent') to battle phase ('attack'|'defense') for the player
  // If possession is 'player', we are attacking. If 'opponent', we are defending.
  const phase = battle.value.possession === "player" ? "attack" : "defense";
  const result = resolveRound(power, oppRating, phase);

  // 3. Update State via Log
  lastMessage.value = result.message;
  battle.value.history.push(`${battle.value.matchMinutes}': ${result.message}`);

  if (result.scoreChanged) {
    if (result.success && battle.value.possession === "player") {
      battle.value.playerScore++;
    } else if (!result.success && battle.value.possession === "opponent") {
      battle.value.opponentScore++;
    }
    // If defending and scoreChanged = true (result.success=false), opponent scored
    // Logic in mechanics:
    // defense + fail -> Tegendoelpunt (scoreChanged=true)
  }

  // Advance Time
  battle.value.matchMinutes += 5;

  // Switch Possession
  // If I scored -> Opponent kick off (opponent possession)
  // If I missed -> Opponent goal kick (opponent possession)
  // If I saved -> My possession
  // If I failed save -> Opponent scored -> My kick off (Player possession)

  // Simple toggle logic for now:
  if (battle.value.possession === "player") {
    battle.value.possession = "opponent";
  } else {
    battle.value.possession = "player";
  }

  // Check End Game
  if (battle.value.matchMinutes >= 90) {
    endGame();
  } else {
    setTimeout(startRound, 2000);
  }
}

function endGame() {
  battle.value!.history.push(
    `FLUITIGNAAL! Eindstand: ${battle.value!.playerScore} - ${battle.value!.opponentScore}`,
  );
  battle.value!.isActive = false;

  const playerScore = battle.value!.playerScore;
  const opponentScore = battle.value!.opponentScore;

  // Perfect Match Bonus (Tournament Only)
  if (
    isTournamentMatch.value &&
    playerScore > opponentScore &&
    matchStreak.value > 0
  ) {
    // Basic check: if we won and ended on a streak, maybe give a small bonus?
    // Real perfect match tracking requires counting total questions vs correct.
    // For now simplistic:
    // If player won and opponent 0 goals? Or just extra medals for winning
  }

  setTimeout(() => {
    // Check if this was a tournament match
    if (isTournamentMatch.value) {
      // Complete the tournament match
      tournamentStore.completeMatch(playerScore, opponentScore);
      gameStore.endBattle();
      // Go back to tournament bracket
      router.push({ name: "VoetbalTournamentBracket" });
    } else {
      // Regular match - show alert and go home
      alert(`Wedstrijd afgelopen! ${playerScore} - ${opponentScore}`);
      router.push("/voetbal-razernij");
      gameStore.endBattle();
    }
  }, 3000); // Little longer delay to read final score
}
</script>

<style scoped>
/* Add any view-specific styles here */
</style>
