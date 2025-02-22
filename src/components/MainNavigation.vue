<template>
  <nav class="fixed top-0 w-full bg-gradient-to-r from-gray-800 to-blue-600 z-10" role="navigation" aria-label="main navigation">
    <div class="flex items-center">
      <router-link to="/" class="px-4 py-2 text-white font-bold">
        Pokemon Leerwereld
      </router-link>

      <button 
        class="px-3 py-2 lg:hidden"
        :class="{ 'bg-gray-700': isMenuOpen }" 
        @click="isMenuOpen = !isMenuOpen"
        aria-label="menu" 
        aria-expanded="false">
        <span class="block w-6 h-0.5 bg-white mb-1"></span>
        <span class="block w-6 h-0.5 bg-white mb-1"></span>
        <span class="block w-6 h-0.5 bg-white"></span>
      </button>
    </div>

    <div class="hidden lg:flex" :class="{ 'block': isMenuOpen }">
      <div class="flex-1">
        <!-- WoordRazernij menu items -->
        <template v-if="currentGame === 'woordrazernij'">
          <router-link class="px-4 py-2 text-white hover:bg-gray-700" to="/woordrazernij/nieuwspel">
            🎮 Nieuw spel
          </router-link>
          <router-link class="px-4 py-2 text-white hover:bg-gray-700" to="/woordrazernij/shop">
            🏪 Pokeball Shop
          </router-link>
          <router-link class="px-4 py-2 text-white hover:bg-gray-700" to="/woordrazernij/inventory">
            🐾 Mijn Pokemons
          </router-link>
        </template>

        <!-- TafelRazernij menu items -->
        <template v-if="currentGame === 'tafelrazernij'">
          <router-link class="px-4 py-2 text-white hover:bg-gray-700" to="/tafel-razernij">
            🎲 Kies Tafel
          </router-link>
          <router-link class="px-4 py-2 text-white hover:bg-gray-700" to="/tafel-razernij/inventory">
            🐾 Mijn Pokemons
          </router-link>
        </template>
      </div>

      <div class="relative group">
        <button class="px-4 py-2 text-white hover:bg-gray-700">
          Games
        </button>
        <div class="hidden group-hover:block absolute right-0 bg-gray-800 w-48 py-2">
          <router-link class="block px-4 py-2 text-white hover:bg-gray-700" to="/woordrazernij">
            Woord Razernij
          </router-link>
          <router-link class="block px-4 py-2 text-white hover:bg-gray-700" to="/tafel-razernij">
            Tafel Razernij
          </router-link>
          <hr class="border-gray-600 my-2">
          <router-link class="block px-4 py-2 text-white hover:bg-gray-700" to="/">
            Terug naar Start
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMenuOpen = ref(false)

const currentGame = computed(() => {
  if (route.path.includes('woordrazernij')) return 'woordrazernij'
  if (route.path.includes('tafel-razernij')) return 'tafelrazernij'
  return null
})
</script>