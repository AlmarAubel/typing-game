import { defineStore } from "pinia";
import wordsJson from "../assets/words.json";
import { computed, ref } from "vue";

export const useGameSettingsStore = defineStore("gameSettings", () => {
  const wordLists = ref<Record<string, string[]>>(wordsJson);
  const selectedWordList = ref<string>("AVI-Start-kort");
  const gameDurationInSec = ref<number>(120);
  const gameDurationMs = computed(() => gameDurationInSec.value * 1000);

  const difficulties: Record<string, number> = {
    easy: 0.0005,
    medium: 0.001,
    hard: 0.002,
    extreme: 0.016,
  };
  type Difficulties = typeof difficulties;
  type Difficulty = keyof Difficulties;

  const difficulty = ref<Difficulty>("easy");
  const speed = computed(() => difficulties[difficulty.value]);

  const wordList = computed(() => (wordLists.value ? wordLists.value[selectedWordList.value] : []));

  return {
    difficulty,
    difficulties,
    wordLists,
    selectedWordList,
    gameDurationInSec,
    gameDurationMs,
    wordList,
    speed,
  };
});
