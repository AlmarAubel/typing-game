<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router"; // Voeg useRouter import toe
import { usePokemonStore } from "../stores/pokemon";
import PokemonSidebar from "../components/PokemonSidebar.vue"; // Import the new component

const route = useRoute();
const practiceType = (route.query.type as string) || "multiple-choice";
const isRandom = route.query.random === "1";
const answer = ref("");

const pokemonStore = usePokemonStore();

const currentNumber = ref(1);
const selectedTables = computed(() => {
  const tableParam = route.params.table as string;
  return tableParam.split(',').map(t => parseInt(t));
});
const currentTable = ref(selectedTables.value[0]);
const isAnimating = ref(false);
const pokeball = ref<HTMLElement | null>(null);
const clickPosition = ref({ x: 0, y: 0 }); // Add this to store click position
const currentPokemon = ref<{
  id: number;
  sprite: string;
  name: string;
  cry: string;
  audioElement?: HTMLAudioElement; // Add this
} | null>(null);
const pokeballRotation = ref(0);
const pokemonPosition = ref({ x: 0, y: 0 });
const isCatching = ref(false);
const isWrongAnswer = ref(false);

const correctAnswer = computed(() => currentTable.value * currentNumber.value);
const options = computed(() => generateOptions(correctAnswer.value));

const gameContainer = ref<HTMLElement | null>(null);

function getRandomPosition() {
  // Bereken random positie binnen het speelveld (20% marge van de randen)
  const x = Math.random() * 60 + 20; // 20% tot 80% van breedte
  const y = Math.random() * 40 + 30; // 30% tot 70% van hoogte
  return { x, y };
}

async function generateRandomPokemon() {
  const id = Math.floor(Math.random() * 151) + 1;
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();

  // Create and pre-load the audio
  const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`);
  await audio.load(); // Pre-load the audio

  currentPokemon.value = {
    id: data.id,
    sprite: data.sprites.front_default,
    name: data.name,
    cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`,
    audioElement: audio,
  };
  pokemonPosition.value = getRandomPosition();
}

onMounted(() => {
  generateRandomPokemon();
});

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

const throwPokeball = async (targetX: number, targetY: number, isCorrect: boolean) => {
  if (!pokeball.value) return;

  isAnimating.value = true;

  const startX = clickPosition.value.x;
  const startY = clickPosition.value.y;

  // Position pokeball at start position
  pokeball.value.style.left = `${startX}px`;
  pokeball.value.style.top = `${startY}px`;
  pokeball.value.style.transform = "translate(-50%, -50%)";

  // Bereken de afstand voor de boog
  const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
  const arcHeight = isCorrect ? -distance * 0.5 : -distance * 0.7; // Hogere boog bij miss

  // Bereken miss offset gebaseerd op afstand
  const missOffset = isCorrect ? 0 : Math.random() > 0.5 ? distance * 0.3 : -distance * 0.3;

  const animation = pokeball.value.animate(
    [
      {
        transform: "translate(-50%, -50%) rotate(0deg)",
        offset: 0,
      },
      {
        // Midpoint heeft maximale hoogte in de boog
        transform: `translate(calc(${(targetX - startX) / 2}px - 50%), calc(${arcHeight}px - 50%)) rotate(${360}deg)`,
        offset: 0.5,
      },
      {
        transform: `translate(calc(${targetX - startX + missOffset}px - 50%), calc(${targetY - startY}px - 50%)) rotate(${720}deg)`,
        offset: 1,
      },
    ],
    {
      duration: isCorrect ? 1000 : 800,
      easing: "cubic-bezier(.37,0,.63,1)", // Custom easing for more natuurlijke boog
    }
  );

  await animation.finished;

  if (isCorrect) {
    isCatching.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isCatching.value = false;
  } else {
    isWrongAnswer.value = true;
    await new Promise((resolve) => setTimeout(resolve, 500));
    isWrongAnswer.value = false;
  }

  isAnimating.value = false;
  return true;
};

// Voeg deze functie toe voor random getallen
const getNextNumber = () => {
  if (isRandom) {
    if (Math.random() < 0.8) { // 20% chance to change table
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

const answerInput = ref<HTMLInputElement | null>(null);

const soundEnabled = ref(localStorage.getItem("pokemon-sound-enabled") !== "false");

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

const checkAnswer = async (userAnswer: number | string, event?: MouseEvent | null) => {
  if (isAnimating.value) return;

  const container = gameContainer.value;
  if (!container) return;

  const containerRect = container.getBoundingClientRect();

  // Store click position relative to game container
  if (event) {
    clickPosition.value = {
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
    };
  } else {
    // For enter key, use the submit button position
    const submitButton = document.querySelector(".submit-button") as HTMLElement;
    if (submitButton) {
      const buttonRect = submitButton.getBoundingClientRect();
      clickPosition.value = {
        x: buttonRect.left + buttonRect.width / 2 - containerRect.left,
        y: buttonRect.top + buttonRect.height / 2 - containerRect.top,
      };
    }
  }

  const numericAnswer = Number(userAnswer);
  const isCorrect = numericAnswer === correctAnswer.value;
  const pokemon = container.querySelector(".current-pokemon") as HTMLElement;
  if (!pokemon) return;

  const pokemonRect = pokemon.getBoundingClientRect();
  const targetX = pokemonRect.left + pokemonRect.width / 2 - containerRect.left;
  const targetY = pokemonRect.top + pokemonRect.height / 2 - containerRect.top;

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
    if (practiceType === "open") {
      answer.value = "";
      setTimeout(() => {
        answerInput.value?.focus();
      }, 0);
    }
  }
};
</script>

<template>
  <div class="h-full grid grid-cols-[1fr_350px] overflow-hidden">
    <!-- Main Game Area -->
    <div class="flex flex-col p-4">
      <div ref="gameContainer" class="relative flex-1 bg-gray-100 rounded-xl p-4">
        <!-- Top Bar with Sound and Table -->
        <div class="flex justify-between items-center mb-4">
          <div class="text-4xl font-bold">{{ currentNumber }} x {{ currentTable }} = ?</div>
          <button class="p-3 rounded-full hover:bg-gray-200 transition-colors" @click="toggleSound">
            <span class="text-2xl">{{ soundEnabled ? "🔊" : "🔇" }}</span>
          </button>
        </div>

        <div
          v-if="currentPokemon"
          class="absolute z-10"
          :style="{
            left: `${pokemonPosition.x}%`,
            top: `${pokemonPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }"
        >
          <img
            :src="currentPokemon.sprite"
            :alt="'Pokemon #' + currentPokemon.id"
            class="current-pokemon"
            :class="{
              catching: isCatching,
              'animate-shake': isWrongAnswer,
            }"
          />
        </div>

        <img
          ref="pokeball"
          src="/pokeball.png"
          alt="Pokeball"
          class="w-12 h-12 absolute left-1/2 bottom-8 -translate-x-1/2 transition-all duration-300 z-20"
          :class="{ 'animate-spin': isAnimating }"
          :style="{
            transform: `translateX(-50%) rotate(${pokeballRotation}deg)`,
          }"
        />

        <!-- Answer Options -->
        <div class="absolute bottom-8 left-0 right-0 z-30">
          <template v-if="practiceType === 'multiple-choice'">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto px-4">
              <button
                v-for="option in options"
                :key="option"
                @click="(e: MouseEvent) => checkAnswer(option, e)"
                :disabled="isAnimating"
                class="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-xl font-bold transition-colors"
              >
                {{ option }}
              </button>
            </div>
          </template>

          <template v-else>
            <div class="flex justify-center space-x-4 max-w-md mx-auto px-4">
              <input
                ref="answerInput"
                type="number"
                v-model="answer"
                @keyup.enter="checkAnswer(answer, null)"
                :disabled="isAnimating"
                placeholder="Type je antwoord..."
                class="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                @click="(e: MouseEvent) => checkAnswer(answer, e)"
                :disabled="isAnimating"
                class="submit-button px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-xl font-bold transition-colors"
              >
                ✓
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Pokemon Sidebar -->
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

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

.current-pokemon {
  width: 120px;
  height: 120px;
  z-index: 15;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  image-rendering: pixelated;
  animation: float 3s ease-in-out infinite;
}

.current-pokemon.catching {
  animation: catch-pokemon 1s ease-in-out;
}

.current-pokemon.dodging {
  animation: dodge 0.5s ease-in-out;
}

@keyframes dodge {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }

  25% {
    transform: translateX(-20px) rotate(-10deg);
  }

  75% {
    transform: translateX(20px) rotate(10deg);
  }
}

@keyframes catch-pokemon {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }

  50% {
    transform: scale(0.5) rotate(180deg);
    opacity: 0.7;
  }

  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
}

.current-pokemon img {
  width: 100px;
  height: 100px;
  image-rendering: pixelated;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}


/* Ensure the game container takes available space */
/* #gameContainer {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
} */
</style>
