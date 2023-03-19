<template>
  <div class="game-container">
    <div class="lpm">LPM: {{ game.calculateLPM() }}</div>
    <div class="lives">Lives: {{ game.lives }}</div>

    <div v-if="!game.gameStarted" class="difficulty-selector">
      <button @click="onDifficultyButtonClick('easy')">Easy</button>
      <button @click="onDifficultyButtonClick('medium')">Medium</button>
      <button @click="onDifficultyButtonClick('hard')">Hard</button>
      <button @click="onDifficultyButtonClick('extreme')">Extreme</button>
    </div>

    <div class="score">
      Score: {{ game.score }}
      <button @click="onRestartButtonClick">↺</button>
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

    <div
      v-if="game.activeWord"
      :style="{
        top: game.wordTopPosition + 'px',
        left: game.wordLeftPosition + 'px',
      }"
      class="word"
    >
      <template v-for="(char, index) in game.activeWord.split('')" :key="index">
        <span :class="{ correct: index < game.activeIndex }">{{ char }}</span>
      </template>
    </div>

    <div v-if="game.lives === 0" class="game-over">
      <div class="message">Game Over! Your score is: {{ game.score }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useGameStore } from "../store/game";

const game = useGameStore();

onMounted(() => {
  game.loadWordLists();
});

const onDifficultyButtonClick = (difficulty: string) => {
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.lpm,
.lives {
  position: absolute;
  font-size: 20px;
}

.lpm {
  top: 10px;
  left: 10px;
}

.lives {
  top: 40px;
  left: 10px;
}

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

.difficulty-selector {
  display: flex;
  margin-bottom: 20px;
}

∫ .difficulty-selector button {
  margin: 0 10px;
  padding: 5px 15px;
  font-size: 18px;
  cursor: pointer;
}

.score {
  position: absolute;
  top: 50px;
  right: 10px;
  font-size: 20px;
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
</style>
