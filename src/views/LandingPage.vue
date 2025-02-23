<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-8">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-8">Welkom bij de Pokemon Leerwereld!</h1>
    <div class="flex flex-col md:flex-row gap-6 max-w-4xl w-full">
      <router-link :to="{ name: 'woord-home' }" class="flex-1 p-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
        <div class="text-white">
          <h2 class="text-2xl font-bold mb-2">Woord Razernij</h2>
          <p>Train je typesnelheid en vang Pokemons!</p>
        </div>
      </router-link>
      <router-link :to="{ name: 'tafel-home' }" class="flex-1 p-6 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
        <div class="text-white">
          <h2 class="text-2xl font-bold mb-2">Tafel Razernij</h2>
          <p>Oefen tafels en verzamel Pokemons!</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
}

.game-buttons {
  display: flex;
  gap: 2rem;
  margin-top: 3rem;
  flex-wrap: wrap;
  justify-content: center;
}

.game-button {
  width: 300px;
  height: 200px;
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  text-decoration: none;
  color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.game-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.game-button.woord {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%);
}

.game-button.tafel {
  background: linear-gradient(135deg, #4834d4 0%, #686de0 100%);
}

.content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
}

.title {
  margin-bottom: 0.5rem;
  color: white;
}

p {
  margin: 0;
  opacity: 0.9;
}
</style>
