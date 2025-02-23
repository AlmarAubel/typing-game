import { defineStore } from "pinia";
import { usePokemonStore } from "./pokemonStore";
import { computed, reactive } from "vue";
import { useGameSettingsStore } from "@/woordrazernij/store/gameSettingsStore";

type GameState = "NewGame" | "Running" | "Gameover" | "Ended";

interface ActiveWord {
  word: string;
  typedCharacters: string;
}

interface State {
  activeWord: ActiveWord | null;
  activeIndex: number;
  score: number;
  letterCount: number;
  gameState: GameState;
  startTime: Date | null;
  lives: number;
  gameStarted: boolean;
  wordTopPosition: number;
  wordLeftPosition: number;
  animationInterval: number | null;
}

export const useGameStore = defineStore("game", () => {
  const state = reactive<State>({
    activeWord: null,
    activeIndex: 0,
    score: 0,
    gameState: "NewGame",
    letterCount: 0,
    startTime: null,
    lives: 3,
    gameStarted: false,
    wordTopPosition: 0,
    wordLeftPosition: 0,
    animationInterval: null,
  });
  const settings = useGameSettingsStore();
  const calculateLPM = computed((): number => {
    if (!state.startTime) return 0;

    const currentTime = new Date();
    const minutes = Math.max((currentTime.getTime() - state.startTime.getTime()) / 1000 / 60, 1);
    const lpm = Math.round(state.letterCount / minutes);
    return lpm;
  });

  function startGame() {
    restartGame();
    state.gameState = "Running";
    state.gameStarted = true;
    startNewWord();
    state.letterCount = 0;
    state.startTime = new Date();
  }

  function restartGame() {
    state.score = 0;
    state.lives = 3;
    state.gameStarted = false;
    state.gameState = "NewGame";
  }

  function handleKeyPress(key: string) {
    if (state.activeWord && state.activeWord.word[state.activeIndex] === key && key.match(/^[a-zA-Z]$/)) {
      state.activeWord.typedCharacters = state.activeWord.typedCharacters + key;
      state.activeIndex++;
      state.letterCount++;
      if (state.activeIndex === state.activeWord.word.length) {
        state.score += 1 * 5;
        startNewWord();
      }
    }
  }

  function startNewWord() {
    if (state.activeWord) {
      removeWordElement();
    }
    const word = getRandomWord();
    state.activeWord = {
      word,
      typedCharacters: '' 
    };
    state.activeIndex = 0;
    const windowHeight = window.innerHeight;
    const maxHeight = windowHeight - 100;
    const randomHeight = Math.floor(Math.random() * maxHeight);
    state.wordTopPosition = randomHeight;
    if (settings.difficulty !== "easy") {
      animateWord();
    } else {
      const windowWidth = window.innerWidth;
      const maxWidth = windowWidth - 100;
      const wordWidth = 24 * state.activeWord.word.length;
      const randomWidth = Math.floor(Math.random() * (maxWidth - wordWidth));
      state.wordLeftPosition = randomWidth;
    }
  }

  function removeWordElement() {
    if (state.animationInterval) {
      clearInterval(state.animationInterval);
    }
    state.wordLeftPosition = 0;
  }

  function getRandomWord(): string {
    const words = settings.wordList;
    return words[Math.floor(Math.random() * words.length)];
  }

  function animateWord() {
    const screenWidth = window.innerWidth;
    const speed = screenWidth * settings.speed;
    
    if (state.animationInterval) {
      clearInterval(state.animationInterval);
    }

    state.animationInterval = setInterval(() => {
      if (!state.gameStarted) {
        if (state.animationInterval) {
          clearInterval(state.animationInterval);
        }
        return;
      }

      state.wordLeftPosition += speed;
      if (state.activeWord) {
        const wordWidth = 24 * state.activeWord.word.length;
        if (state.wordLeftPosition >= screenWidth - wordWidth) {
          if (state.animationInterval) {
            clearInterval(state.animationInterval);
          }
          decreaseLives();
          startNewWord();
        }
      }
    }, 1000 / 60);
  }

  function decreaseLives() {
    if (state.lives > 0) {
      state.lives--;
      if (state.lives === 0) {
        gameOver("Gameover");
      }
    }
  }

  function gameOver(reason: "Gameover" | "Ended") {
    const pokemonStore = usePokemonStore();
    pokemonStore.addPoints(state.score);
    if (state.animationInterval) {
      clearInterval(state.animationInterval);
    }
    state.gameState = reason ?? "Gameover";
    state.gameStarted = false;
  }

  return {
    state,
    gameOver,
    handleKeyPress,
    restartGame,
    startGame,
    calculateLPM,
  };
});
