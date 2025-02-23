<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePokemonStore } from "../stores/pokemon";
import PokemonSidebar from "../components/PokemonSidebar.vue";
import AnswerInput from "../components/AnswerInput.vue";
import GamePokemon from "../components/GamePokemon.vue";
import GamePokeball from "../components/GamePokeball.vue";

const route = useRoute();
const practiceType = (route.query.type as string) || "multiple-choice";
const isRandom = route.query.random === "1";
const pokemonStore = usePokemonStore();

const currentNumber = ref(1);
const selectedTables = computed(() => {
  const tableParam = route.params.table as string;
  return tableParam.split(",").map((t) => parseInt(t));
});
const currentTable = ref(selectedTables.value[0]);
const isAnimating = ref(false);
const clickPosition = ref({ x: 0, y: 0 });
const targetPosition = ref({ x: 0, y: 0 }); // added targetPosition
const currentPokemon = ref<{
  id: number;
  sprite: string;
  name: string;
  cry: string;
  audioElement?: HTMLAudioElement;
} | null>(null);
const pokemonPosition = ref({ x: 0, y: 0 });
const isCatching = ref(false);
const isWrongAnswer = ref(false);
const gameContainer = ref<HTMLElement | null>(null);

const correctAnswer = computed(() => currentTable.value * currentNumber.value);
const options = computed(() => generateOptions(correctAnswer.value));

const soundEnabled = ref(localStorage.getItem("pokemon-sound-enabled") !== "false");

function getRandomPosition() {
  return {
    x: Math.random() * 60 + 20,
    y: Math.random() * 40 + 30,
  };
}

async function generateRandomPokemon() {
  const id = Math.floor(Math.random() * 151) + 1;
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();

  const audio = new Audio(
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
  );
  await audio.load();

  currentPokemon.value = {
    id: data.id,
    sprite: data.sprites.front_default,
    name: data.name,
    cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`,
    audioElement: audio,
  };
  pokemonPosition.value = getRandomPosition();
}

function generateOptions(answer: number) {
  const opts = [answer];
  while (opts.length < 4) {
    const randomOpt = answer + Math.floor(Math.random() * 10) - 5;
    if (!opts.includes(randomOpt) && randomOpt > 0) {
      opts.push(randomOpt);
    }
  }
  return opts.sort(() => Math.random() - 0.5);
}

const getNextNumber = () => {
  if (isRandom) {
    if (Math.random() < 0.8) {
      const currentIndex = selectedTables.value.indexOf(currentTable.value);
      const nextIndex = (currentIndex + 1) % selectedTables.value.length;
      currentTable.value = selectedTables.value[nextIndex];
    }
    return Math.floor(Math.random() * 10) + 1;
  }

  if (currentNumber.value >= 10) {
    currentNumber.value = 1;
    const currentIndex = selectedTables.value.indexOf(currentTable.value);
    const nextIndex = (currentIndex + 1) % selectedTables.value.length;
    currentTable.value = selectedTables.value[nextIndex];
    return 1;
  }

  return currentNumber.value + 1;
};

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
  localStorage.setItem("pokemon-sound-enabled", soundEnabled.value.toString());
};

const playCry = () => {
  if (currentPokemon.value?.audioElement && soundEnabled.value) {
    currentPokemon.value.audioElement.currentTime = 0;
    currentPokemon.value.audioElement.play();
  }
};

const throwPokeball = async (targetX: number, targetY: number, isCorrect: boolean) => {
  const container = gameContainer.value;
  if (!container) return;

  isAnimating.value = true;

  const containerRect = container.getBoundingClientRect();
  const pokemonElement = container.querySelector(".current-pokemon") as HTMLElement;
  if (!pokemonElement) return;

  const pokemonRect = pokemonElement.getBoundingClientRect();

  // Start positie onderaan
  const startY = containerRect.height - 100;
  // Eind positie bij de Pokemon
  const endY = pokemonRect.top - containerRect.top + pokemonRect.height / 2;

  // Bereken de afstand die de Pokeball moet afleggen
  const distance = startY - endY;

  clickPosition.value = {
    x: pokemonRect.left + pokemonRect.width / 2 - containerRect.left,
    y: startY,
  };

  // Update de CSS variabele voor de werpafstand
  const pokeballElement = container.querySelector(".pokeball") as HTMLElement;
  if (pokeballElement) {
    pokeballElement.style.setProperty("--throw-height", `${-distance}px`);
  }

  // Wacht tot de Pokeball bijna de Pokemon raakt (ongeveer 70% van de animatie)
  await new Promise((resolve) =>
    setTimeout(resolve, isCorrect ? 245 : 350)
  ); // 0.35s * 0.7 voor correct, 0.5s * 0.7 voor miss

  if (isCorrect) {
    isCatching.value = true;
    await new Promise((resolve) => setTimeout(resolve, 105)); // Resterende 30% van de animatie
    isCatching.value = false;
  } else {
    isWrongAnswer.value = true;
    await new Promise((resolve) => setTimeout(resolve, 150));
    isWrongAnswer.value = false;
  }

  isAnimating.value = false;
  return true;
};

const checkAnswer = async (userAnswer: number, event?: MouseEvent | null) => {
  if (isAnimating.value) return;

  const container = gameContainer.value;
  if (!container) return;

  const isCorrect = userAnswer === correctAnswer.value;
  const containerRect = container.getBoundingClientRect();
  const pokemonElement = container.querySelector(".current-pokemon") as HTMLElement;

  if (!pokemonElement) return;

  const pokemonRect = pokemonElement.getBoundingClientRect();
  // Compute target position relative to container
  const targetX = pokemonRect.left + pokemonRect.width / 2;
  const targetY = pokemonRect.top + pokemonRect.height / 2;
  targetPosition.value = {
    x: targetX - containerRect.left,
    y: targetY - containerRect.top,
  };

  if (isCorrect) {
    playCry();
  }

  await throwPokeball(targetX, targetY, isCorrect);

  if (isCorrect && currentPokemon.value) {
    await pokemonStore.catchPokemon({
      id: currentPokemon.value.id,
      sprite: currentPokemon.value.sprite,
      name: currentPokemon.value.name,
      cry: currentPokemon.value.cry,
    });
    currentNumber.value = getNextNumber();
    await generateRandomPokemon();
  }
};

onMounted(() => {
  generateRandomPokemon();
});
</script>

<template>
  <div class="h-full grid grid-cols-[1fr_350px] overflow-hidden">
    <div class="flex flex-col p-4">
      <div ref="gameContainer" class="relative flex-1 bg-gray-100 rounded-xl p-4">
        <div class="flex justify-between items-center mb-4">
          <div class="text-4xl font-bold">{{ currentNumber }} x {{ currentTable }} = ?</div>
          <button class="p-3 rounded-full hover:bg-gray-200 transition-colors" @click="toggleSound">
            <span class="text-2xl">{{ soundEnabled ? "🔊" : "🔇" }}</span>
          </button>
        </div>

        <GamePokemon v-if="currentPokemon" :pokemon="currentPokemon" :position="pokemonPosition"
          :is-catching="isCatching" :is-wrong-answer="isWrongAnswer" />

        <GamePokeball :is-animating="isAnimating" :click-position="clickPosition" :target-position="targetPosition"
          :is-wrong-answer="isWrongAnswer" />

        <AnswerInput :options="options" :is-animating="isAnimating" :practice-type="practiceType"
          @check-answer="checkAnswer" />
      </div>
    </div>

    <div class="bg-gray-50 p-4 overflow-y-auto border-l">
      <PokemonSidebar />
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

* {
  font-family: "Roboto", sans-serif;
}
</style>
