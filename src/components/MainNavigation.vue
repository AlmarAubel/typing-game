<template>
  <nav class="fixed top-0 w-full bg-gradient-to-r from-gray-800 to-blue-600 z-10 shadow-lg" role="navigation" aria-label="main navigation">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo/Home link -->
        <router-link to="/" class="text-white font-bold text-xl hover:text-gray-200">
          Pokemon Leerwereld
        </router-link>

        <!-- Desktop menu -->
        <div class="hidden lg:flex items-center space-x-4">
          <!-- Game specific items -->
          <template v-if="currentGame === 'woordrazernij'">
            <router-link class="nav-link" to="/woordrazernij/nieuwspel">🎮 Nieuw spel</router-link>
            <router-link class="nav-link" to="/woordrazernij/shop">🏪 Pokeball Shop</router-link>
            <router-link class="nav-link" to="/woordrazernij/inventory">🐾 Mijn Pokemons</router-link>
          </template>

          <template v-if="currentGame === 'tafelrazernij'">
            <router-link class="nav-link" to="/tafel-razernij">🎲 Kies Tafel</router-link>
            <router-link class="nav-link" to="/tafel-razernij/inventory">🐾 Mijn Pokemons</router-link>
          </template>

          <!-- Games dropdown -->
          <div class="relative group">
            <button 
              class="nav-link inline-flex items-center"
              @click="toggleGamesMenu"
              ref="gamesMenuButton"
            >
              <span>Games</span>
              <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              v-show="isGamesOpen"
              class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50"
              @click="closeGamesMenu"
            >
              <router-link class="dropdown-item" to="/woordrazernij">Woord Razernij</router-link>
              <router-link class="dropdown-item" to="/tafel-razernij">Tafel Razernij</router-link>
              <div class="border-t border-gray-700 my-1"></div>
              <router-link class="dropdown-item" to="/">Terug naar Start</router-link>
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <button 
          class="lg:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none"
          @click="toggleMobileMenu"
          aria-label="Menu"
        >
          <svg 
            class="h-6 w-6 text-white"
            :class="{ 'hidden': isMenuOpen, 'block': !isMenuOpen }"
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg 
            class="h-6 w-6 text-white"
            :class="{ 'block': isMenuOpen, 'hidden': !isMenuOpen }"
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <div 
        class="lg:hidden"
        :class="{ 'block': isMenuOpen, 'hidden': !isMenuOpen }"
      >
        <div class="px-2 pt-2 pb-3 space-y-1">
          <template v-if="currentGame === 'woordrazernij'">
            <router-link class="mobile-nav-link" to="/woordrazernij/nieuwspel" @click="closeMobileMenu">🎮 Nieuw spel</router-link>
            <router-link class="mobile-nav-link" to="/woordrazernij/shop" @click="closeMobileMenu">🏪 Pokeball Shop</router-link>
            <router-link class="mobile-nav-link" to="/woordrazernij/inventory" @click="closeMobileMenu">🐾 Mijn Pokemons</router-link>
          </template>

          <template v-if="currentGame === 'tafelrazernij'">
            <router-link class="mobile-nav-link" to="/tafel-razernij" @click="closeMobileMenu">🎲 Kies Tafel</router-link>
            <router-link class="mobile-nav-link" to="/tafel-razernij/inventory" @click="closeMobileMenu">🐾 Mijn Pokemons</router-link>
          </template>

          <div class="border-t border-gray-700 my-2"></div>
          <router-link class="mobile-nav-link" to="/woordrazernij" @click="closeMobileMenu">Woord Razernij</router-link>
          <router-link class="mobile-nav-link" to="/tafel-razernij" @click="closeMobileMenu">Tafel Razernij</router-link>
          <router-link class="mobile-nav-link" to="/" @click="closeMobileMenu">Terug naar Start</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isMenuOpen = ref(false);
const isGamesOpen = ref(false);
const gamesMenuButton = ref<HTMLElement | null>(null);

const currentGame = computed(() => {
  if (route.path.includes("woordrazernij")) return "woordrazernij";
  if (route.path.includes("tafel-razernij")) return "tafelrazernij";
  return null;
});

const toggleMobileMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) isGamesOpen.value = false;
};

const toggleGamesMenu = () => {
  isGamesOpen.value = !isGamesOpen.value;
};

const closeMobileMenu = () => {
  isMenuOpen.value = false;
};

const closeGamesMenu = () => {
  isGamesOpen.value = false;
};

// Click outside handler voor desktop games menu
const handleClickOutside = (event: MouseEvent) => {
  if (gamesMenuButton.value && !gamesMenuButton.value.contains(event.target as Node)) {
    isGamesOpen.value = false;
  }
};

// Keyboard handler voor accessibility
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isGamesOpen.value = false;
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
@reference "../style.css";
.nav-link {
  @apply px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-700 transition-colors;
}

.dropdown-item {
  @apply block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors;
}

.mobile-nav-link {
  @apply block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors;
}
</style>
