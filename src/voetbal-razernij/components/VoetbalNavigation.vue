<template>
  <nav class="voetbal-navigation">
    <div class="flex items-center gap-4">
      <!-- Game Logo -->
      <RouterLink
        to="/voetbal-razernij"
        class="flex items-center gap-2 text-white hover:text-yellow-300 transition-colors"
      >
        <span class="text-2xl">⚽</span>
        <span class="font-bold">Voetbal</span>
      </RouterLink>

      <!-- Navigation Links -->
      <div class="hidden md:flex items-center gap-3">
        <RouterLink
          to="/voetbal-razernij/table-select"
          class="nav-link"
          active-class="nav-link-active"
        >
          🏠 Start
        </RouterLink>

        <RouterLink
          to="/voetbal-razernij/collection"
          class="nav-link"
          active-class="nav-link-active"
        >
          🎴 Collectie
        </RouterLink>

        <RouterLink
          to="/voetbal-razernij/team-builder"
          class="nav-link"
          active-class="nav-link-active"
        >
          ⚽ Team
        </RouterLink>

        <RouterLink
          to="/voetbal-razernij/collection"
          class="nav-link shop-link"
          active-class="nav-link-active"
        >
          🏪 Shop
        </RouterLink>
      </div>

      <!-- Quick Stats -->
      <div class="ml-auto flex items-center gap-4">
        <!-- Coins -->
        <div
          class="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full"
        >
          <span class="text-lg">🪙</span>
          <span class="font-bold text-yellow-200">{{
            gameStore.totalCoins
          }}</span>
        </div>

        <!-- Active Session Indicator -->
        <div
          v-if="gameStore.isSessionActive"
          class="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full"
        >
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-sm text-green-200 font-medium">
            ⏱️ {{ formatTime(gameStore.sessionTimeRemaining) }}
          </span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useVoetbalGameStore } from "../stores";

const gameStore = useVoetbalGameStore();

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
</script>

<style scoped>
.nav-link {
  padding: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shop-link {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.2),
    rgba(34, 197, 94, 0.1)
  );
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.shop-link:hover {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.3),
    rgba(34, 197, 94, 0.2)
  );
}
</style>
