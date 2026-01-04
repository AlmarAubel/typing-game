<template>
  <div
    class="voetbal-layout min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600"
  >
    <!-- Background pattern for football theme -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-10 left-10 text-6xl animate-bounce">⚽</div>
      <div class="absolute top-32 right-20 text-4xl animate-pulse">🏆</div>
      <div class="absolute bottom-32 left-20 text-5xl animate-bounce delay-300">
        🥅
      </div>
      <div class="absolute bottom-16 right-16 text-4xl animate-pulse delay-500">
        🏟️
      </div>
    </div>

    <div class="relative z-10 container mx-auto px-4 py-6">
      <!-- Game Header -->
      <header class="text-center mb-8">
        <h1
          class="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg"
        >
          ⚽ Voetbal Razernij
        </h1>
        <p class="text-xl drop-shadow" style="color: rgba(255, 255, 255, 0.9)">
          Verzamel Eredivisie sterren door tafels te oefenen!
        </p>
      </header>

      <!-- Content Area -->
      <main class="relative">
        <!-- Initialization Error -->
        <div
          v-if="initializationError"
          class="mb-6 bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mx-4"
        >
          <div class="flex items-center gap-3 text-white">
            <span class="text-2xl">⚠️</span>
            <p class="text-sm">{{ initializationError }}</p>
          </div>
        </div>

        <RouterView />
      </main>

      <!-- Global Game Stats Bar -->
      <div
        class="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6"
      >
        <div
          class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 border border-white/20"
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <!-- Coins -->
              <div class="flex items-center gap-2">
                <span class="text-2xl">🪙</span>
                <span class="font-bold text-yellow-600">{{
                  gameStore.totalCoins
                }}</span>
              </div>

              <!-- Current Session Info -->
              <div
                v-if="gameStore.isSessionActive"
                class="flex items-center gap-3"
              >
                <div
                  class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                ></div>
                <span class="text-sm font-medium text-gray-600"
                  >Sessie actief</span
                >
                <div class="flex items-center gap-1">
                  <span class="text-xl">⏱️</span>
                  <span class="font-mono text-green-600 font-bold">{{
                    formatTime(gameStore.sessionTimeRemaining)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Quick Navigation -->
            <div class="flex gap-2">
              <RouterLink
                to="/voetbal-razernij/table-select"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg"
              >
                🏠 Start
              </RouterLink>
              <RouterLink
                to="/voetbal-razernij/collection"
                class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all transform hover:scale-105 shadow-lg"
              >
                🎴 Collectie
              </RouterLink>
              <RouterLink
                to="/voetbal-razernij/team-builder"
                class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg"
              >
                ⚽ Team
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useVoetbalGameStore } from "./stores";
import { FootballDataService } from "./utils/football-data";

const gameStore = useVoetbalGameStore();
const initializationError = ref<string>("");

// Initialize football data on mount
onMounted(async () => {
  try {
    if (!FootballDataService.isInitialized()) {
      console.log("Initializing FootballDataService...");
      await FootballDataService.initialize();
      console.log("FootballDataService initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize football data:", error);
    initializationError.value =
      "Kon de voetbaldata niet laden. Sommige functies werken mogelijk niet correct.";
  }
});

// Format time remaining in session
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
</script>

<style scoped>
@reference "tailwindcss";

/* Custom football-themed animations */
@keyframes football-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-football-spin {
  animation: football-spin 3s linear infinite;
}

/* 3D-style button effects */
.voetbal-layout button,
.voetbal-layout .router-link-active {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

/* Gradient text effects */
.gradient-text {
  background: linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
