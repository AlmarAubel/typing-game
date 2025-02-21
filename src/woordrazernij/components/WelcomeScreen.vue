<template>
  <section class="section hero-reasons">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-vcentered">
          <div class="column is-half">
            <router-link class="button cta-button is-large" :to="{ name: 'NewGame' }">Speel het spel</router-link>
          </div>
          <div class="column is-half has-text-right animate__animated animate__backInRight">
            <h1 class="title is-1 has-text-white">Woordrazernij</h1>
            <p class="subtitle is-3 has-text-white">Typen, verzamelen en meester worden met Woordrazernij!</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="section">
    <h2 class="title is-3 has-text-centered mb-6">Drie redenen waarom je Woordrazernij écht moet spelen:</h2>

    <div class="container">
      <div class="columns">
        <div class="column is-one-third animate__animated animate__fadeInUp">
          <h3 class="title is-4"><strong>1. Razendsnelle type-actie</strong></h3>
          <p>Oefen je typevaardigheden op verschillende niveaus en wordt een ware meester in het typen.</p>
        </div>
        <div class="column is-one-third animate__animated animate__fadeInUp" data-animate="fadeInUp" data-animate-delay="200">
          <h3 class="title is-4"><strong>2. Verzamel Pokémon</strong></h3>
          <p>Speel het spel, verdien punten en gebruik deze om Pokéballs te kopen waarmee je Pokémon kunt verzamelen.</p>
        </div>
        <div class="column is-one-third animate__animated animate__fadeInUp" data-animate="fadeInUp" data-animate-delay="400">
          <h3 class="title is-4"><strong>3. Uitdagende en verslavende gameplay</strong></h3>
          <p>Met diverse moeilijkheidsgraden, een grote verscheidenheid aan woorden en de mogelijkheid om je verzameling Pokémon uit te breiden, blijf je steeds terugkomen voor meer.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2 class="title is-3 has-text-centered mb-6">Ontdek enkele geweldige functies van Woordrazernij:</h2>
      <div class="columns">
        <div class="column is-half">
          <h3 class="title is-4"><strong>Meerdere moeilijkheidsgraden</strong></h3>
          <p>Begin als beginner en werk je op naar het expertniveau, terwijl je je typevaardigheden verbetert.</p>
        </div>
        <div class="column is-half">
          <h3 class="title is-4"><strong>Uitgebreide Pokémon-collectie</strong></h3>
          <p>Verzamel en ontdek een breed scala aan Pokémon terwijl je speelt en bouw je eigen unieke verzameling op.</p>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer has-background-dark">
    <div class="content has-text-centered has-text-white">
      <p class="mb-4">&copy; 2023 WoordRazernij. Alle rechten voorbehouden.</p>
     
    </div>
  </footer>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
const heroImage = '/assets/hero.jpeg';
const router = useRouter();
</script>
<style scoped>
.hero {
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("hero-background.jpg") no-repeat center center;
  background-size: cover;
  color: white;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.hero-reasons {
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
              url(v-bind(heroImage)) no-repeat center center;
  background-size: cover;
  color: white;
  padding: 3rem 0;
}

.cta-button {
  background-color: #f8bc06;
  color: #000;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 5px;
  transition: all 0.2s;
}

.cta-button:hover {
  background-color: #d4a003;
  text-decoration: none;
}
</style>
