<template>
  <div class="player-avatar" :class="[size]">
    <img
      v-if="player.imageUrl"
      :src="player.imageUrl"
      :alt="player.name"
      class="player-photo"
      @error="handleImageError($event)"
    />
    <span v-else class="player-fallback">👤</span>
    <div v-if="showShirtNumber" class="shirt-number">
      #{{ player.shirtNumber }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerCard } from "../utils/football-data";

interface Props {
  player: PlayerCard;
  size?: "small" | "medium" | "large";
  showShirtNumber?: boolean;
}

withDefaults(defineProps<Props>(), {
  size: "medium",
  showShirtNumber: true,
});

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
  // Show fallback icon
  const fallback = img.nextElementSibling;
  if (fallback) {
    (fallback as HTMLElement).style.display = "block";
  }
}
</script>

<style scoped>
@reference "tailwindcss";
.player-avatar {
  @apply relative rounded-full flex items-center justify-center;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
  /* Add margin to prevent shirt number clipping */
  margin: 12px;
}

.player-avatar .player-photo,
.player-avatar .player-fallback {
  border-radius: 50%;
}

.player-avatar.small {
  @apply w-12 h-12;
}

.player-avatar.medium {
  @apply w-20 h-20;
}

.player-avatar.large {
  @apply w-32 h-32;
}

.player-photo {
  @apply w-full h-full object-cover;
  border-radius: 50%;
  overflow: hidden;
}

.player-fallback {
  @apply text-gray-600;
}

.player-avatar.small .player-fallback {
  @apply text-2xl;
}

.player-avatar.medium .player-fallback {
  @apply text-4xl;
}

.player-avatar.large .player-fallback {
  @apply text-6xl;
}

.player-avatar img + span {
  display: none;
}

.shirt-number {
  @apply absolute bg-gray-800 text-white rounded-full flex items-center justify-center font-bold;
  top: -8px;
  right: -8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.player-avatar.small .shirt-number {
  @apply w-6 h-6 text-xs;
  top: -2px;
  right: -2px;
}

.player-avatar.medium .shirt-number {
  @apply w-8 h-8 text-sm;
  top: -4px;
  right: -4px;
}

.player-avatar.large .shirt-number {
  @apply w-10 h-10 text-base;
  top: -6px;
  right: -6px;
}
</style>
