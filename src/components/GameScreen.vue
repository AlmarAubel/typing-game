<template>
  <div class="fullheight-content">
    <div class="game-container level">
      <div class="level-left">
        <div class="columns is-vcentered">
          <div class="column is-narrow">
            <div class="lpm">LPM: {{ game.calculateLPM }}</div>
            <div class="lives">Lives: {{ game.state.lives }}</div>
          </div>
        </div>
      </div>
      <div class="timer">
        {{ formattedTime }}
      </div>
      <div class="score level-right">
        <div class="columns is-vcentered">
          <div class="column is-narrow">
            <div class="container">
              Score: {{ game.state.score }}
              <button @click="onRestartButtonClick">↺</button>
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
            <span>
              <button @click="onRestartButtonClick">↺ Start nieuw spel</button>
            </span>
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
const { timeLeft, start } = useTimeoutTimer(settings.gameDurationMs, gameEnded);
const [useOnscreenKeyboard, toggleOnscreenKeyboard] = useToggle();
const shouldShowKeyboard = computed(() => game.state.gameState === "Running" && useOnscreenKeyboard.value);

onMounted(() => {
  start();
  game.startGame();
});

const formattedTime = computed(() => formatMilliseconds(timeLeft.value, false));

function gameEnded() {
  game.gameOver("Ended");
}

const onRestartButtonClick = () => {
  game.restartGame();
};

const onKeyPress = (event: KeyboardEvent) => {
  if (game.state.gameStarted) {
    game.handleKeyPress(event.key);
  }
};

document.addEventListener("keypress", onKeyPress);
</script>

<style>
.word {
  position: absolute;
  font-size: 24px;
  background-color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  user-select: none;
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

.score button {
  margin-left: 10px;
  background: none;
  border: none;
  cursor: pointer;
}

.fullheight-content {
  min-height: calc(100vh - 10rem); /* Subtract the navbar height (3.25rem by default in Bulma) */
}
</style>
