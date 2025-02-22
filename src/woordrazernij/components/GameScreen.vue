<template>
  <div class="min-h-screen">
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-start">
        <div class="flex flex-col">
          <div class="text-2xl mb-2">LPM: {{ game.calculateLPM }}</div>
          <div class="text-2xl">Lives: {{ repeatChar("❤️", game.state.lives) }}</div>
        </div>
        <div class="text-2xl">{{ formattedTime }}</div>
        <div class="flex flex-col items-end">
          <div class="text-2xl mb-2">Score: {{ game.state.score }}</div>
          <div class="flex gap-2">
            <router-link class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded" role="button" to="/nieuwspel">↺</router-link>
            <on-screen-keyboard-toggle @keypressed="onKeyPress" :show-keyboard="shouldShowKeyboard" />
          </div>
        </div>
      </div>

      <div v-if="game.state.gameState === 'Gameover' || game.state.gameState === 'Ended'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="bg-gray-100 px-6 py-4 rounded-t-lg font-bold">{{ game.state.gameState }}</div>
          <div class="p-6">
            <span class="block mb-4">Je score is: {{ game.state.score }}</span>
            <router-link class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded" role="button" to="/nieuwspel">
              <span>🎮 Nieuw spel starten</span>
            </router-link>
          </div>
        </div>
      </div>

      <div
        v-if="game.state.activeWord"
        :style="{
          top: game.state.wordTopPosition + 'px',
          left: game.state.wordLeftPosition + 'px',
        }"
        class="absolute"
      >
        <div class="font-mono text-xl">
          <span
            v-for="(char, index) in game.state.activeWord.word"
            :key="index"
            :class="{
              'text-green-500': index < game.state.activeWord.typedCharacters.length && char === game.state.activeWord.typedCharacters[index],
              'text-red-500': index < game.state.activeWord.typedCharacters.length && char !== game.state.activeWord.typedCharacters[index],
            }"
          >
            {{ char }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useGameStore } from "../store/game";
import useTimeoutTimer from "../utils/useTimeoutTime";
import { formatMilliseconds } from "../utils/helpers";
import OnScreenKeyboardToggle from "./OnScreenKeyboardToggle.vue";
import { useToggle } from "@vueuse/core";
import { useGameSettingsStore } from "@/woordrazernij/store/gameSettingsStore";

const game = useGameStore();
const settings = useGameSettingsStore();
const { timeLeft, start } = useTimeoutTimer(settings.gameDurationMs, () => game.gameOver("Ended"));
const [useOnscreenKeyboard, toggleOnscreenKeyboard] = useToggle();
const shouldShowKeyboard = computed(() => game.state.gameState === "Running" && useOnscreenKeyboard.value);

onMounted(() => {
  start();
  game.startGame();
});

const formattedTime = computed(() => formatMilliseconds(timeLeft.value, false));

const onKeyPress = (event: KeyboardEvent) => {
  if (game.state.gameStarted) {
    game.handleKeyPress(event.key);
  }
};

function repeatChar(char: string, n: number) {
  return char.repeat(n);
}

document.addEventListener("keypress", onKeyPress);
</script>
