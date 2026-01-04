<template>
  <div
    class="player-card"
    :class="[player.rarity, { 'card-duplicate': isDuplicate }]"
    :style="{ '--delay': animationDelay }"
  >
    <!-- Card Front -->
    <div class="card-front">
      <!-- Rarity Glow -->
      <div class="rarity-glow" :class="player.rarity"></div>

      <!-- Player Image Area -->
      <div class="player-image-area">
        <div class="position-badge">
          {{ formatPosition(player.position) }}
        </div>
        <PlayerAvatar :player="player" size="large" :showShirtNumber="true" />
      </div>

      <!-- Player Info -->
      <div class="player-info">
        <h3 class="player-name">{{ player.name }}</h3>
        <div class="player-rating">
          <span class="rating-value">{{ player.rating }}</span>
          <div class="rating-stars">
            <span
              v-for="star in getRatingStars(player.rating)"
              :key="star"
              class="star"
              >⭐</span
            >
          </div>
        </div>
      </div>

      <!-- Rarity Banner -->
      <div class="rarity-banner" :class="player.rarity">
        <span class="rarity-text">{{ formatRarity(player.rarity) }}</span>
        <span class="rarity-icon">
          <span v-if="player.rarity === 'common'">⚪</span>
          <span v-if="player.rarity === 'uncommon'">🟢</span>
          <span v-if="player.rarity === 'rare'">🔵</span>
          <span v-if="player.rarity === 'legendary'">🟡</span>
        </span>
      </div>

      <!-- Duplicate Indicator -->
      <div v-if="isDuplicate" class="duplicate-badge">
        <span>🔄 Kopie #{{ copyNumber }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from "../utils/football-data";
import PlayerAvatar from "./PlayerAvatar.vue";

interface Props {
  player: Player;
  isDuplicate: boolean;
  copyNumber: number;
  animationDelay: string;
}

defineProps<Props>();

function getRatingStars(rating: number): number {
  return Math.min(5, Math.ceil(rating / 20));
}

function formatPosition(position: string): string {
  const positions = {
    K: "Keeper",
    D: "Verdediger",
    M: "Middenvelder",
    A: "Aanvaller",
  };
  return positions[position as keyof typeof positions] || position;
}

function formatRarity(rarity: string): string {
  const rarities = {
    common: "Gewoon",
    uncommon: "Ongewoon",
    rare: "Zeldzaam",
    legendary: "Legendarisch",
  };
  return rarities[rarity as keyof typeof rarities] || rarity;
}
</script>

<style scoped>
@reference "tailwindcss";
.player-card {
  @apply bg-white rounded-3xl shadow-2xl overflow-hidden cursor-default;
  animation: card-appear 0.6s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateY(30px) rotateX(10deg);
  width: 220px;
  height: 330px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
}

.player-card:hover {
  transform: translateY(-5px) scale(1.05);
}

.player-card.common {
  box-shadow: 0 20px 60px rgba(107, 114, 128, 0.4);
}

.player-card.uncommon {
  box-shadow: 0 20px 60px rgba(34, 197, 94, 0.4);
}

.player-card.rare {
  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);
}

.player-card.legendary {
  box-shadow: 0 20px 60px rgba(251, 191, 36, 0.6);
  animation: legendary-glow 2s ease-in-out infinite alternate;
}

.rarity-glow {
  @apply absolute inset-0 opacity-20 pointer-events-none;
}

.rarity-glow.common {
  background: radial-gradient(circle, #6b7280 0%, transparent 70%);
}

.rarity-glow.uncommon {
  background: radial-gradient(circle, #22c55e 0%, transparent 70%);
}

.rarity-glow.rare {
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
}

.rarity-glow.legendary {
  background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
  animation: legendary-pulse 2s ease-in-out infinite;
}

.card-front {
  @apply p-6 h-full flex flex-col;
}

.player-image-area {
  @apply relative flex-1 flex items-center justify-center;
}

.position-badge {
  @apply absolute top-0 left-0 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold;
}

.player-info {
  @apply text-center;
  margin-bottom: 16px;
}

.player-name {
  @apply text-xl font-bold text-gray-800;
}

.player-rating {
  @apply flex items-center justify-between;
}

.rating-value {
  @apply text-2xl font-black text-blue-600;
}

.rating-stars {
  @apply flex;
}

.star {
  @apply text-sm;
}

.rarity-banner {
  @apply absolute bottom-0 left-0 right-0 text-center py-2 text-white font-bold;
}

.rarity-banner.common {
  @apply bg-gray-500;
}

.rarity-banner.uncommon {
  @apply bg-green-500;
}

.rarity-banner.rare {
  @apply bg-blue-500;
}

.rarity-banner.legendary {
  @apply bg-yellow-500;
}

.duplicate-badge {
  @apply absolute top-1 right-1 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateY(30px) rotateX(10deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

@keyframes legendary-glow {
  from {
    box-shadow: 0 20px 60px rgba(251, 191, 36, 0.6);
  }
  to {
    box-shadow: 0 25px 80px rgba(251, 191, 36, 0.9);
  }
}

@keyframes legendary-pulse {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
