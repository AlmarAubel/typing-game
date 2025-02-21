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

const goBack = () => {
  router.push('/')
}

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
      transform: `translate(${(targetX - startX + missOffset/2)}px, ${(targetY - startY - 200 - missHeight)}px) rotate(${720}deg)`,
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
  const pokemon = document.querySelector('.current-pokemon') as HTMLElement
  if (!pokemon) return

  const rect = pokemon.getBoundingClientRect()
  
  if (isCorrect) {
    playCry() // Start het geluid direct bij een correct antwoord
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
      // Focus the input after a short delay to ensure the DOM is updated
      setTimeout(() => {
        answerInput.value?.focus()
      }, 0)
    }
  }
}
</script>

<template>
  <div class="game-container">
    <div class="game-main">
      <div class="top-buttons">
        <button class="back-button" @click="goBack">
          <span class="back-icon">←</span>
          Terug naar tafels
        </button>
      </div>

      <div class="question">
        {{ currentNumber }} x  {{ selectedTable }} = ?
      </div>
      
      <div class="game-field">
        <!-- <div class="pokemon-info" v-if="currentPokemon">
          <h3>Huidige Pokémon</h3>
          <p><strong>Naam:</strong> {{ currentPokemon.name }}</p>
          <p><strong>ID:</strong> {{ currentPokemon.id }}</p>
          <img :src="currentPokemon.sprite" :alt="currentPokemon.name" class="pokemon-sprite"> 
        </div> -->

        <div 
          class="current-pokemon" 
          v-if="currentPokemon"
          :style="{
            left: `${pokemonPosition.x}%`,
            top: `${pokemonPosition.y}%`
          }"
          :class="{ 
            'catching': isCatching,
            'dodging': isWrongAnswer 
          }"
        >
          <img :src="currentPokemon.sprite" :alt="'Pokemon #' + currentPokemon.id">
        </div>
        
        <img 
          ref="pokeball" 
          src="/pokeball.png" 
          class="pokeball" 
          :class="{ 'is-throwing': isAnimating }"
        >
        
        <button class="sound-button" @click="toggleSound">
          <span class="sound-icon">{{ soundEnabled ? '🔊' : '🔇' }}</span>
        </button>
      </div>

      <div class="answer-section">
        <template v-if="practiceType === 'multiple-choice'">
          <div class="options">
            <button
              v-for="option in options"
              :key="option"
              @click="checkAnswer(option)"
              class="option-button"
              :disabled="isAnimating"
            >
              {{ option }}
            </button>
          </div>
        </template>
        
        <template v-else>
          <div class="open-answer">
            <input
              ref="answerInput"
              type="number"
              v-model="answer"
              @keyup.enter="checkAnswer(answer)"
              :disabled="isAnimating"
              placeholder="Type je antwoord..."
            >
            <button 
              @click="checkAnswer(answer)"
              :disabled="isAnimating || !answer"
              class="submit-button"
            >
              Gooi Pokéball
            </button>
          </div>
        </template>
      </div>
    </div>

    <PokemonSidebar /> 
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

* {
  font-family: 'Roboto', sans-serif;
}

.back-button {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: none;
  border-radius: 8px;
  color: #2c3e50;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.back-icon {
  font-size: 1.2em;
}

.game-main {
  padding-top: 4rem;
  padding: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.game-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  height: 100vh;
  overflow: hidden;
}

.game-field {
  width: 100%;
  height: 40vh; /* Adjust the height to be dynamic */
  background: linear-gradient(to bottom, #87CEEB, #90EE90);
  border-radius: 16px;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pokemon-info {
  margin-left: 0.35rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 200px;
}

.pokemon-sprite {
  width: 100%;
  height: auto;
}

.current-pokemon {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.current-pokemon.catching {
  animation: catch-pokemon 1s ease-in-out;
}

.current-pokemon.dodging img {
  animation: dodge 0.5s ease-in-out;
}

@keyframes dodge {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-20px) rotate(-10deg); }
  75% { transform: translateX(20px) rotate(10deg); }
}

@keyframes catch-pokemon {
  0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(0.5) rotate(180deg); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(0) rotate(360deg); opacity: 0; }
}

.current-pokemon img {
  width: 100px;
  height: 100px;
  image-rendering: pixelated;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
}

.pokeball {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 2;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.is-throwing {
  pointer-events: none;
}

.question {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.answer-section {
  margin: 1rem 0;
}

.options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  max-width: 300px;
  margin: 0 auto;
}

.option-button {
  padding: 0.75rem;
  font-size: 1.2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-width: 10rem;
  transition: transform 0.2s, background-color 0.2s;
}

.option-button:hover:not(:disabled) {
  transform: scale(1.05);
  background: #45a049;
}

.option-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.pokemon-sidebar {
  background: rgba(255,255,255,0.95);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow-y: auto;
  height: 100%;
}

.pokemon-collection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem;
}

.pokemon {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.pokemon:hover {
  transform: translateY(-2px);
}

.pokemon-image {
  position: relative;
  background: linear-gradient(to bottom, #f0f0f0, #ffffff);
  padding: 0.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.pokemon-image img {
  width: 100%;
  height: auto;
  display: block;
}

.pokemon-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 0.8rem;
  padding: 0.25rem;
  text-align: center;
  text-transform: capitalize;
}

.open-answer {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 1rem 0;
}

.open-answer input {
  width: 100px;
  font-size: 1.2rem;
  padding: 0.5rem;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  text-align: center;
}

.submit-button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.top-buttons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
}

.sound-button {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.75rem;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.sound-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.sound-icon {
  font-size: 1.2em;
}
</style>


