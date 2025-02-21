<template>
  <div class="fullheight-content typegame">
    <div class="game-container level">
      <div class="level-left">
        <div class="columns">
          <div class="column is-narrow">
            <div class="lpm is-size-4">LPM: {{ game.calculateLPM }}</div>
            <div class="lives is-size-4">Lives: {{ repeatChar("❤️", game.state.lives) }}</div>
          </div>
        </div>
      </div>
      <div class="timer is-size-4">
        {{ formattedTime }}
      </div>
      <div class="level-right">
        <div class="columns">
          <div class="column is-narrow">
            <div class="is-size-4">Score: {{ game.state.score }}</div>
            <div class="buttons">
              <router-link class="button is-danger" role="button" to="/nieuwspel"> ↺</router-link>
              <on-screen-keyboard-toggle @keypressed="onKeyPress" :show-keyboard="shouldShowKeyboard" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="game.state.gameState === 'Gameover' || game.state.gameState === 'Ended'" class="difficulty-selector modal is-active is-clipped">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">{{ game.state.gameState }}</header>
          <section class="modal-card-body">
            <span> Je score is: {{ game.state.score }} </span>
            <br />
            <div>
              <router-link class="button" role="button" to="/nieuwspel">
                <span>🎮 Nieuw spel starten</span>
              </router-link>
            </div>
          </section>
        </div>
      </div>
      <div
        v-if="game.state.activeWord"
        :style="{
          top: game.state.wordTopPosition + 'px',
          left: game.state.wordLeftPosition + 'px',
        }"
        class="word"
      >
        <template v-for="(char, index) in game.state.activeWord?.split('')" :key="index">
          <span :class="{ correct: index < game.state.activeIndex }">{{ char }}</span>
        </template>
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
import { useGameSettingsStore } from "@/store/gameSettingsStore";

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

<style scoped>
.typegame {
  background: lightgray;
}
.word {
  position: absolute;
  font-size: 24px;
  background-color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  user-select: none;
  z-index: 99999;
}

.correct {
  color: #4caf50;
}

∫ .difficulty-selector button {
  margin: 0 10px;
  padding: 5px 15px;
  font-size: 18px;
  cursor: pointer;
}

.fullheight-content {
  min-height: calc(100vh - 52px); /* Subtract the navbar height (3.25rem by default in Bulma) */
}
</style>
