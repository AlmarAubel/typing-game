<template>
  <div class="fullheight-content hero">
    <div class="game-container level">
      <div class="level-left">
        <div class="columns is-vcentered">
          <div class="column is-narrow">
            <div class="lpm">LPM: {{ game.calculateLPM() }}</div>
            <div class="lives">Lives: {{ game.lives }}</div>
          </div>
        </div>
      </div>
      <div class="score level-right">
        <div class="columns is-vcentered">
          <div class="column is-narrow">
            <div class="container">
              Score: {{ game.score }}
              <button @click="onRestartButtonClick">↺</button>
            </div>

            <select v-model="game.selectedWordList">
              <option
                v-for="wordList in Object.keys(game.wordLists)"
                :key="wordList"
                :value="wordList"
              >
                {{ wordList }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div
        v-if="!game.gameStarted"
        class="difficulty-selector modal is-active is-clipped"
      >
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">Kies je moeilijkheid</header>
          <section class="modal-card-body">
            <span>
              {{ gameOverText }}
            </span>

            <div class="buttons">
              <button
                class="button is-info is-light"
                @click="onDifficultyButtonClick('easy')"
              >
                Makkelijk
              </button>
              <button
                class="button is-success is-light"
                @click="onDifficultyButtonClick('medium')"
              >
                Gemiddeld
              </button>
              <button
                class="button is-warning is-light"
                @click="onDifficultyButtonClick('hard')"
              >
                Moeilijk
              </button>
              <button
                class="button is-danger is-light"
                @click="onDifficultyButtonClick('extreme')"
              >
                Extreem
              </button>
            </div>
          </section>
        </div>
      </div>

      <div
        v-if="game.activeWord"
        :style="{
          top: game.wordTopPosition + 'px',
          left: game.wordLeftPosition + 'px',
        }"
        class="word"
      >
        <template
          v-for="(char, index) in game.activeWord.split('')"
          :key="index"
        >
          <span :class="{ correct: index < game.activeIndex }">{{ char }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {  onMounted, } from "vue";
import { useGameStore } from "../store/game";
import { computed } from "@vue/reactivity";

const game = useGameStore();
const gameOverText = computed(() =>
    game.lives === 0 && game.letterCount > 0
        ? `Game Over! Je score is: ${game.score}`
        : ""
);
onMounted(() => {
  game.loadWordLists();
});

const onDifficultyButtonClick = (difficulty: string) => {
  game.restartGame();
  game.startGame(difficulty);
};

const onRestartButtonClick = () => {
  game.restartGame();
};

const onKeyPress = (event: KeyboardEvent) => {
  if (game.gameStarted) {
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

/* .difficulty-selector {
  display: flex;
  margin-bottom: 20px;
} */

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

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.fullheight-content {
  min-height: calc(
    100vh - 10rem
  ); /* Subtract the navbar height (3.25rem by default in Bulma) */
}
</style>
