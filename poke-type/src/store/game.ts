import { defineStore } from "pinia";
import wordsJson from "../assets/words.json";
import { usePokemonStore } from "./pokemonStore";

interface State {
  wordLists: Record<string, string[]>;
  selectedWordList: string;
  activeWord: string | null;
  activeIndex: number;
  words: string[];
  score: number;
  difficulty: string;
  letterCount: number;

  startTime: Date | null;
  lives: number;
  gameStarted: boolean;
  wordTopPosition: number;
  wordLeftPosition: number;
  animationInterval: number | null;
  difficulties: Record<string, number>;
}

const pointsMultiplier: { [key: string]: number } = {
  easy: 4,
  medium: 2,
  hard: 1,
  extreme: 1,
};

export const useGameStore = defineStore("game", {
  state: (): State => ({
    wordLists: {},
    selectedWordList: "AVI-Start-kort",
    activeWord: null,
    activeIndex: 0,
    score: 0,
    words: ["x"],
    difficulty: "",
    letterCount: 0,
    startTime: null,
    lives: 3,
    gameStarted: false,
    wordTopPosition: 0,
    wordLeftPosition: 0,
    animationInterval: null,
    difficulties: {
      easy: 0.001,
      medium: 0.002,
      hard: 0.003,
      extreme: 0.006,
    },
  }),
  getters: {
    calculateLPM(state): () => number {
      return () => {
        if (!state.startTime) return 0;

        const currentTime = new Date();
        const minutes = Math.max(
          (currentTime.getTime() - state.startTime.getTime()) / 1000 / 60,
          1
        );
        const lpm = Math.round(state.letterCount / minutes);
        return lpm;
      };
    },
  },
  actions: {
    loadWordLists() {
      this.wordLists = wordsJson;
      this.selectedWordList = Object.keys(this.wordLists)[0];
    },
    selectWordList(selectedWordList: string) {
      this.selectedWordList = selectedWordList;
    },
    startGame(selectedDifficulty: string) {
      this.difficulty = selectedDifficulty;

      this.words = this.wordLists[this.selectedWordList] || [];
      this.gameStarted = true;
      this.startNewWord();
      this.letterCount = 0;
      this.startTime = new Date();
    },

    restartGame() {
      this.score = 0;
      this.lives = 3;
      this.gameStarted = false;
    },

    handleKeyPress(key: string) {
      if (
        this.activeWord &&
        this.activeWord[this.activeIndex] === key &&
        key.match(/^[a-zA-Z]$/)
      ) {
        this.activeIndex++;
        this.letterCount++;
        if (this.activeIndex === this.activeWord.length) {
          const multiplier = pointsMultiplier[this.difficulty];
          this.score += 1 * multiplier;
          //this.score += 2;
          this.startNewWord();
        }
      }
    },

    startNewWord() {
      if (this.activeWord) {
        this.removeWordElement();
      }

      this.activeWord = this.getRandomWord();
      this.activeIndex = 0;

      const windowHeight = window.innerHeight;
      const maxHeight = windowHeight - 100;
      const randomHeight = Math.floor(Math.random() * maxHeight);
      this.wordTopPosition = randomHeight;

      this.animateWord();
    },

    removeWordElement() {
      clearInterval(this.animationInterval!);
      this.wordLeftPosition = 0;
    },

    getRandomWord(): string {
      return this.words[Math.floor(Math.random() * this.words.length)];
    },

    animateWord() {
      const screenWidth = window.innerWidth;
      const speed = screenWidth * this.difficulties[this.difficulty];
      clearInterval(this.animationInterval!);
      this.animationInterval = setInterval(() => {
        if (!this.gameStarted) {
          clearInterval(this.animationInterval!);
          return;
        }
        this.wordLeftPosition += speed;

        const wordWidth = 24 * this.activeWord!.length;

        if (this.wordLeftPosition >= window.innerWidth - wordWidth) {
          clearInterval(this.animationInterval!);
          this.decreaseLives();
          this.startNewWord();
        }
      }, 1000 / 60);
    },

    decreaseLives() {
      if (this.lives > 0) {
        this.lives--;
        if (this.lives === 0) {
          this.gameOver();
        }
      }
    },

    gameOver() {
      const pokemonStore = usePokemonStore();
      pokemonStore.points += this.score;
      clearInterval(this.animationInterval!);
      this.gameStarted = false;
    },
  },
});
