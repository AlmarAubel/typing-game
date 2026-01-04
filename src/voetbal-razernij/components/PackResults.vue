<template>
  <div class="results-summary">
    <div class="summary-stats">
      <div class="summary-stat">
        <div class="stat-icon">🎴</div>
        <div class="stat-value">{{ totalCards }}</div>
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
      <button
        @click="$emit('open-another')"
        class="action-btn primary"
        :disabled="!canAffordAnother"
      >
        🎁 Nog een pakket ({{ packCost }} 🎟️)
      </button>
      <button @click="$emit('view-collection')" class="action-btn secondary">
        📚 Bekijk Collectie
      </button>
      <button @click="$emit('build-team')" class="action-btn secondary">
        ⚽ Team Samenstellen
      </button>
      <button @click="$emit('back-to-store')" class="action-btn tertiary">
        🏪 Terug naar Winkel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  totalCards: number;
  duplicateCount: number;
  rareOrBetterCount: number;
  canAffordAnother: boolean;
  packCost: number;
}

defineProps<Props>();

defineEmits<{
  "open-another": [];
  "view-collection": [];
  "build-team": [];
  "back-to-store": [];
}>();
</script>

<style scoped>
@reference "tailwindcss";
.results-summary {
  @apply text-center pb-8 relative;
  z-index: 20;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  margin-top: 2rem;
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
  @apply flex flex-wrap gap-4 justify-center mt-8 mb-8 relative;
  z-index: 20;
}

.action-btn {
  @apply px-6 py-3 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 min-w-40 text-center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
</style>
