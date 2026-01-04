<template>
  <nav
    class="fixed top-0 w-full bg-gradient-to-r from-gray-800 to-blue-600 z-100 shadow-lg"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <router-link
          :to="{ name: 'home' }"
          class="text-white font-bold text-xl hover:text-gray-200"
          >Spel Razernij</router-link
        >

        <!-- Desktop menu -->
        <div class="hidden lg:flex items-center space-x-4">
          <!-- Game specific navigation -->
          <slot></slot>

          <!-- Direct links -->

          <NavLink
            :to="{ name: 'shared-shop' }"
            class="text-yellow-400 hover:text-yellow-300"
            >💰 Shop</NavLink
          >
          <NavLink
            :to="{ name: 'shared-inventory' }"
            class="text-green-400 hover:text-green-300"
            >🐾 Collectie</NavLink
          >
          <NavLink
            :to="{ name: 'parent-dashboard' }"
            class="text-blue-400 hover:text-blue-300"
            >👨‍👩‍👧‍👦 Ouderportaal</NavLink
          >

          <!-- Games dropdown -->
          <div class="relative group">
            <button
              class="nav-link inline-flex items-center"
              @click="toggleGamesMenu"
              ref="gamesMenuButton"
            >
              <span>Games</span>
              <svg
                class="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              v-show="isGamesOpen"
              class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 flex flex-col"
              @click="closeGamesMenu"
            >
              <NavLink :to="{ name: 'woord-home' }">Woord Razernij</NavLink>
              <NavLink :to="{ name: 'tafel-home-v2' }">Tafel Razernij</NavLink>
              <NavLink :to="{ name: 'VoetbalTableSelect' }"
                >⚽ Voetbal Razernij</NavLink
              >
              <div class="border-t border-gray-700 my-1"></div>
              <NavLink :to="{ name: 'home' }">Terug naar Start</NavLink>
            </div>
          </div>
        </div>

        <button
          class="lg:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none"
          @click="toggleMobileMenu"
          aria-label="Menu"
        >
          <svg
            class="h-6 w-6 text-white"
            :class="{ hidden: isMenuOpen, block: !isMenuOpen }"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <svg
            class="h-6 w-6 text-white"
            :class="{ block: isMenuOpen, hidden: !isMenuOpen }"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <div
        class="lg:hidden"
        :class="{ block: isMenuOpen, hidden: !isMenuOpen }"
      >
        <div class="px-2 pt-2 pb-3 space-y-1">
          <!-- Game specific navigation -->
          <slot></slot>

          <div class="border-t border-gray-700 my-2"></div>

          <!-- Direct links -->
          <NavLink
            :to="{ name: 'shared-shop' }"
            class="block text-yellow-400 hover:text-yellow-300"
            >💰 Shop</NavLink
          >
          <NavLink
            :to="{ name: 'shared-inventory' }"
            class="block text-green-400 hover:text-green-300"
            >🐾 Collectie</NavLink
          >
          <NavLink
            :to="{ name: 'parent-dashboard' }"
            class="block text-blue-400 hover:text-blue-300"
            >👨‍👩‍👧‍👦 Ouderportaal</NavLink
          >

          <div class="border-t border-gray-700 my-2"></div>
          <NavLink :to="{ name: 'woord-home' }" @click="closeMobileMenu"
            >Woord Razernij</NavLink
          >
          <NavLink :to="{ name: 'tafel-home-v2' }" @click="closeMobileMenu"
            >Tafel Razernij</NavLink
          >
          <NavLink :to="{ name: 'VoetbalTableSelect' }" @click="closeMobileMenu"
            >⚽ Voetbal Razernij</NavLink
          >
          <NavLink :to="{ name: 'home' }" @click="closeMobileMenu"
            >Terug naar Start</NavLink
          >
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import NavLink from "./NavLink.vue";

const isMenuOpen = ref(false);
const isGamesOpen = ref(false);
const gamesMenuButton = ref<HTMLElement | null>(null);

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

const handleClickOutside = (event: MouseEvent) => {
  if (
    gamesMenuButton.value &&
    !gamesMenuButton.value.contains(event.target as Node)
  ) {
    isGamesOpen.value = false;
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    isGamesOpen.value = false;
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
});
</script>

<style scoped>
.nav-link {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.nav-link:hover {
  background-color: rgba(55, 65, 81, 1);
}

.dropdown-item {
  display: block;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: white;
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.dropdown-item:hover {
  background-color: rgba(55, 65, 81, 1);
}

.mobile-nav-link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.mobile-nav-link:hover {
  background-color: rgba(55, 65, 81, 1);
}
</style>
