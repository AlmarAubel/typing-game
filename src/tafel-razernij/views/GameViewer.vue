<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'  // Voeg useRouter import toe
import { usePokemonStore } from '../stores/pokemon'
import PokemonSidebar from '../components/PokemonSidebar.vue' // Import the new component

const route = useRoute()
const practiceType = route.query.type as string || 'multiple-choice'
const isRandom = route.query.random === '1'
const answer = ref('')

const pokemonStore = usePokemonStore()

const currentNumber = ref(1)
const selectedTable = parseInt(route.params.table as string)
const isAnimating = ref(false)
const pokeball = ref<HTMLElement | null>(null)
const currentPokemon = ref<{
  id: number;
  sprite: string;
  name: string;
  cry: string;
  audioElement?: HTMLAudioElement; // Add this
} | null>(null)
const pokeballRotation = ref(0)
const pokemonPosition = ref({ x: 0, y: 0 })
const isCatching = ref(false)
const isWrongAnswer = ref(false)

const correctAnswer = computed(() => selectedTable * currentNumber.value)
const options = computed(() => generateOptions(correctAnswer.value))

const router = useRouter()  // Voeg router instantie toe


function getRandomPosition() {
  // Bereken random positie binnen het speelveld (20% marge van de randen)
  const x = Math.random() * 60 + 20 // 20% tot 80% van breedte
  const y = Math.random() * 40 + 30 // 30% tot 70% van hoogte
  return { x, y }
}

async function generateRandomPokemon() {
  const id = Math.floor(Math.random() * 151) + 1
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  const data = await response.json()

  // Create and pre-load the audio
  const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`)
  await audio.load() // Pre-load the audio

  currentPokemon.value = {
    id: data.id,
    sprite: data.sprites.front_default,
    name: data.name,
    cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`,
    audioElement: audio
  }
  pokemonPosition.value = getRandomPosition()
}

onMounted(() => {
  generateRandomPokemon()
})

function generateOptions(answer: number) {
  const opts = [answer]
  while (opts.length < 4) {
    const randomOpt = answer + Math.floor(Math.random() * 10) - 5
    if (!opts.includes(randomOpt) && randomOpt > 0) {
      opts.push(randomOpt)
    }
  }
  return opts.sort(() => Math.random() - 0.5)
}

const throwPokeball = async (targetX: number, targetY: number, isCorrect: boolean) => {
  if (!pokeball.value) return

  isAnimating.value = true
  const ballRect = pokeball.value.getBoundingClientRect()
  const startX = ballRect.left
  const startY = ballRect.top

  // Grotere miss bij fout antwoord
  const missOffset = isCorrect ? 0 : (Math.random() > 0.5 ? 200 : -200)
  const missHeight = isCorrect ? 0 : 100 // Extra hoogte bij miss

  const animation = pokeball.value.animate([
    {
      transform: 'translate(0, 0) rotate(0deg)',
      offset: 0
    },
    {
      transform: `translate(${(targetX - startX + missOffset / 2)}px, ${(targetY - startY - 200 - missHeight)}px) rotate(${720}deg)`,
      offset: 0.5
    },
    {
      transform: `translate(${(targetX - startX + missOffset)}px, ${targetY - startY + 50}px) rotate(${1080}deg)`,
      offset: 1
    }
  ], {
    duration: 1500,
    easing: 'cubic-bezier(.17,.67,.83,.67)'
  })

  await animation.finished

  if (isCorrect) {
    isCatching.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    isCatching.value = false
  } else {
    isWrongAnswer.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    isWrongAnswer.value = false
  }

  isAnimating.value = false
  return true
}

// Voeg deze functie toe voor random getallen
const getNextNumber = () => {
  if (isRandom) {
    return Math.floor(Math.random() * 10) + 1
  }
  return currentNumber.value < 10 ? currentNumber.value + 1 : 1
}

const answerInput = ref<HTMLInputElement | null>(null)

const soundEnabled = ref(localStorage.getItem('pokemon-sound-enabled') !== 'false')

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
  localStorage.setItem('pokemon-sound-enabled', soundEnabled.value.toString())
}

const playCry = () => {
  if (currentPokemon.value?.audioElement && soundEnabled.value) {
    currentPokemon.value.audioElement.currentTime = 0
    currentPokemon.value.audioElement.play()
  }
}

const checkAnswer = async (userAnswer: number | string) => {
  if (isAnimating.value) return
  const numericAnswer = Number(userAnswer)
  const isCorrect = numericAnswer === correctAnswer.value
  const pokemon = document.querySelector('.current-pokemon') as HTMLElement  // Changed to select the img element
  if (!pokemon) return

  const rect = pokemon.getBoundingClientRect()

  if (isCorrect) {
    playCry()
  }

  await throwPokeball(rect.left + rect.width / 2, rect.top + rect.height / 2, isCorrect)

  if (isCorrect && currentPokemon.value) {
    await pokemonStore.catchPokemon({
      id: currentPokemon.value.id,
      sprite: currentPokemon.value.sprite,
      name: currentPokemon.value.name,
      cry: currentPokemon.value.cry
    })
    currentNumber.value = getNextNumber()
    await generateRandomPokemon()
    if (practiceType === 'open') {
      answer.value = ''
      setTimeout(() => {
        answerInput.value?.focus()
      }, 0)
    }
  }
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)]">
    <!-- <div class="min-h-[calc(100vh-4rem)] grid grid-cols-[1fr_300px] gap-4"> -->
    <div class="grid grid-cols-[1fr_300px] gap-4">
      <!-- Main Game Area -->
      <div class="flex flex-col p-4 h-full overflow-hidden">
        <!-- Game Screen -->
        <div class="relative flex-1 bg-gray-100 rounded-xl p-4 overflow-hidden">
          <!-- Top Bar with Sound and Table -->
          <div class="flex justify-between items-center mb-4">
            <div class="text-4xl font-bold">
              {{ currentNumber }} x {{ selectedTable }} = ?
            </div>
            <button class="p-3 rounded-full hover:bg-gray-200 transition-colors" @click="toggleSound">
              <span class="text-2xl">{{ soundEnabled ? '🔊' : '🔇' }}</span>
            </button>
          </div>

          <div v-if="currentPokemon" class="absolute z-10" :style="{
            left: `${pokemonPosition.x}%`,
            top: `${pokemonPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }">
            <img :src="currentPokemon.sprite" :alt="'Pokemon #' + currentPokemon.id" class="current-pokemon" :class="{
              'catching': isCatching,
              'animate-shake': isWrongAnswer
            }">
          </div>

          <img ref="pokeball" src="/pokeball.png" alt="Pokeball"
            class="w-12 h-12 absolute left-1/2 bottom-8 -translate-x-1/2 transition-all duration-300 z-20"
            :class="{ 'animate-spin': isAnimating }" :style="{
              transform: `translateX(-50%) rotate(${pokeballRotation}deg)`
            }">

          <!-- Answer Options -->
          <div class="absolute bottom-8 left-0 right-0 z-30">
            <template v-if="practiceType === 'multiple-choice'">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto px-4">
                <button v-for="option in options" :key="option" @click="checkAnswer(option)" :disabled="isAnimating"
                  class="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-xl font-bold transition-colors">
                  {{ option }}
                </button>
              </div>
            </template>

            <template v-else>
              <div class="flex justify-center space-x-4 max-w-md mx-auto px-4">
                <input ref="answerInput" type="number" v-model="answer" @keyup.enter="checkAnswer(answer)"
                  :disabled="isAnimating" placeholder="Type je antwoord..."
                  class="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <button @click="checkAnswer(answer)" :disabled="isAnimating"
                  class="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-xl font-bold transition-colors">
                  ✓
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Pokemon Sidebar -->

      <div class="bg-gray-50 p-4 overflow-y-auto border-l h-screen">
        <PokemonSidebar />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

* {
  font-family: 'Roboto', sans-serif;
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
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

/* Add these new styles */
.main-content {
  margin-top: 4rem;
  /* 64px to match the nav height */
}

/* Update the game container to take remaining height */
.game-container {
  min-height: calc(100vh - 4rem);
  height: 100%;
}
</style>
