<template>
  <div class="fixed top-0 w-full bg-white shadow-md">
    <div class="flex items-center justify-start px-4">
      <router-link class="px-4 py-3 hover:bg-gray-100 transition-colors" role="button" to="/nieuwspel">
        <span>🎮 Nieuw spel starten</span>
      </router-link>
      <router-link class="px-4 py-3 hover:bg-gray-100 transition-colors" role="button" to="/shop">
        <span>🏪 Pokeball Shop</span>
      </router-link>
      <router-link class="px-4 py-3 hover:bg-gray-100 transition-colors" role="button" to="/inventory">
        <span>🐾 My Pokemons</span>
      </router-link>
    </div>
  </div>
</template>
