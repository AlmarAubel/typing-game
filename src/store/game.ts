import {defineStore} from "pinia";
import wordsJson from "../assets/words.json";
import {usePokemonStore} from "./pokemonStore";
import {useStorage} from '@vueuse/core'
import {computed, reactive} from "vue";

type GameState = "NewGame" | "Running" | "Gameover" | "Ended";

interface State {
    wordLists: Record<string, string[]>;
    selectedWordList: string;
    activeWord: string | null;
    activeIndex: number;
    words: string[];
    score: number;
    difficulty: string;
    letterCount: number;
    gameState: GameState;
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

export const useGameStore = defineStore("game", () => {
    const state = reactive<State>({
        wordLists: {},
        selectedWordList: "AVI-Start-kort",
        activeWord: null,
        activeIndex: 0,
        score: 0,
        words: ["x"],
        difficulty: "",
        gameState: "NewGame",
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
            extreme: 0.016,
        },
    })
    const calculateLPM = computed((): number => {

            if (!state.startTime) return 0;

            const currentTime = new Date();
            const minutes = Math.max(
                (currentTime.getTime() - state.startTime.getTime()) / 1000 / 60,
                1
            );
            const lpm = Math.round(state.letterCount / minutes);
            return lpm;
        }
    )
    
    function loadWordLists() {
        state.wordLists = wordsJson;
        state.selectedWordList = Object.keys(state.wordLists)[0];
    }
    
    function selectWordList(selectedWordList: string) {
        state.selectedWordList = selectedWordList;
    }

    function startGame(selectedDifficulty: string) {
        state.difficulty = selectedDifficulty;
        state.gameState = "Running";
        state.words = state.wordLists[state.selectedWordList] || [];
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
        if (
            state.activeWord &&
            state.activeWord[state.activeIndex] === key &&
            key.match(/^[a-zA-Z]$/)
        ) {
            state.activeIndex++;
            state.letterCount++;
            if (state.activeIndex === state.activeWord.length) {
                const multiplier = pointsMultiplier[state.difficulty];
                state.score += 1 * multiplier;
                //state.score += 2;
                startNewWord();
            }
        }
    }

    function startNewWord() {
        if (state.activeWord) {
            removeWordElement();
        }

        state.activeWord = getRandomWord();
        state.activeIndex = 0;

        const windowHeight = window.innerHeight;
        const maxHeight = windowHeight - 100;
        const randomHeight = Math.floor(Math.random() * maxHeight);
        state.wordTopPosition = randomHeight;

        animateWord();
    }

    function removeWordElement() {
        clearInterval(state.animationInterval!);
        state.wordLeftPosition = 0;
    }

    function getRandomWord(): string {
        return state.words[Math.floor(Math.random() * state.words.length)];
    }

    function animateWord() {
        const screenWidth = window.innerWidth;
        const speed = screenWidth * state.difficulties[state.difficulty];
        clearInterval(state.animationInterval!);
        state.animationInterval = setInterval(() => {
            if (!state.gameStarted) {
                clearInterval(state.animationInterval!);
                return;
            }
            state.wordLeftPosition += speed;

            const wordWidth = 24 * state.activeWord!.length;
            if (state.wordLeftPosition >= screenWidth - wordWidth) {
                clearInterval(state.animationInterval!);
                decreaseLives();
                startNewWord();
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
        clearInterval(state.animationInterval!);
        state.gameState = reason ?? "Gameover";
        state.gameStarted = false;
    }
    
    return {
        state,
        gameOver,
        handleKeyPress,
        restartGame,
        startGame,
        selectWordList,
        loadWordLists,
        calculateLPM,
        
    }
    

});


