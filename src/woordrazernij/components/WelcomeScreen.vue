<template>
  <section class="relative min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white">
    <div class="container mx-auto px-4 py-16">
      <div class="flex flex-wrap items-center">
        <div class="w-full lg:w-1/2 text-center lg:text-left">
          <router-link class="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-xl font-bold transition-colors duration-200" :to="{ name: 'woord-newGame' }">
            Speel het spel
          </router-link>
        </div>
        <div class="w-full lg:w-1/2 text-right animate__animated animate__backInRight">
          <h1 class="text-5xl font-bold mb-4">Woordrazernij</h1>
          <p class="text-2xl">Typen, verzamelen en meester worden met Woordrazernij!</p>
        </div>
      </div>
    </div>
  </section>

  <section class="py-16 bg-white">
    <h2 class="text-3xl font-bold text-center mb-12">Drie redenen waarom je Woordrazernij écht moet spelen:</h2>

    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="animate__animated animate__fadeInUp">
          <h3 class="text-2xl font-bold mb-4">1. Razendsnelle type-actie</h3>
          <p class="text-gray-600">Oefen je typevaardigheden op verschillende niveaus en wordt een ware meester in het typen.</p>
        </div>
        <div class="animate__animated animate__fadeInUp" data-animate-delay="200">
          <h3 class="text-2xl font-bold mb-4">2. Verzamel Pokémon</h3>
          <p class="text-gray-600">Speel het spel, verdien punten en gebruik deze om Pokéballs te kopen waarmee je Pokémon kunt verzamelen.</p>
        </div>
        <div class="animate__animated animate__fadeInUp" data-animate-delay="400">
          <h3 class="text-2xl font-bold mb-4">3. Uitdagende en verslavende gameplay</h3>
          <p class="text-gray-600">
            Met diverse moeilijkheidsgraden, een grote verscheidenheid aan woorden en de mogelijkheid om je verzameling Pokémon uit te breiden, blijf je steeds terugkomen voor meer.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="py-16 bg-gray-100">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Ontdek enkele geweldige functies van Woordrazernij:</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-2xl font-bold mb-4">Meerdere moeilijkheidsgraden</h3>
          <p class="text-gray-600">Begin als beginner en werk je op naar het expertniveau, terwijl je je typevaardigheden verbetert.</p>
        </div>
        <div>
          <h3 class="text-2xl font-bold mb-4">Uitgebreide Pokémon-collectie</h3>
          <p class="text-gray-600">Verzamel en ontdek een breed scala aan Pokémon terwijl je speelt en bouw je eigen unieke verzameling op.</p>
        </div>
      </div>
    </div>
  </section>

  <footer class="bg-gray-900 text-white py-8">
    <div class="container mx-auto px-4 text-center">
      <p class="mb-4">&copy; 2023 WoordRazernij. Alle rechten voorbehouden.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const heroImage = "/assets/hero.jpeg";
const router = useRouter();
</script>
