<template>
  <div class="fullheight-content ">
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
              <on-screen-keyboard-toggle @keypressed="onKeyPress" :showKeyboard="shouldShowKeyboard"/>
            </div>
          </div>
        </div>
      </div>

      <div
          v-if="game.state.gameState === 'NewGame'"
          class="difficulty-selector modal is-active is-clipped"
      >
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">Kies je moeilijkheid</header>
          <section class="modal-card-body">
            <select v-model="game.state.selectedWordList">
              <option
                  v-for="wordList in Object.keys(game.state.wordLists)"
                  :key="wordList"
                  :value="wordList"
              >
                {{ wordList }}
              </option>
            </select>
            <div>
              Spel duur in seconden
              <input :value="gameDuration" @input="(event:any) =>gameDuration= event.target.value"/>
            </div>
            <div>
              <button class="button is-primary" @click="toggleOnscreenKeyboard()">               
                Scherm toetsenboard {{ useOnscreenKeyboard ? "️✔" :"❌"  }}
              </button>
            </div>

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
          v-if="game.state.gameState === 'Gameover' || game.state.gameState==='Ended'"
          class="difficulty-selector modal is-active is-clipped"
      >
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">{{ game.state.gameState }}</header>
          <section class="modal-card-body">

            <span> Je score is: {{ game.state.score }} </span>
            <br/>
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
        <template
            v-for="(char, index) in game.state.activeWord?.split('')"
            :key="index"
        >
          <span :class="{ correct: index < game.state.activeIndex }">{{ char }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {useGameStore} from "../store/game";
import useTimeoutTimer from "../utils/useTimeoutTime";
import {formatMilliseconds} from "../utils/helpers";
import OnScreenKeyboardToggle from "./OnScreenKeyboardToggle.vue";
import {useToggle} from "@vueuse/core";

const game = useGameStore();
const gameDuration = ref<number>(120);
const gameDurationMs = computed(() => gameDuration.value * 1000);
const {timeLeft,  start} = useTimeoutTimer(gameDurationMs, gameEnded);
const [useOnscreenKeyboard, toggleOnscreenKeyboard] = useToggle()
const shouldShowKeyboard = computed(() => game.state.gameState === "Running" && useOnscreenKeyboard.value)
onMounted(() => {
  game.loadWordLists();
});
const formattedTime = computed(() => formatMilliseconds(timeLeft.value, false));


function gameEnded() {
  game.gameOver("Ended")
}

const onDifficultyButtonClick = (difficulty: string) => {
  game.restartGame();
  game.startGame(difficulty);
  start();
};

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
  min-height: calc(
      100vh - 10rem
  ); /* Subtract the navbar height (3.25rem by default in Bulma) */
}
</style>
