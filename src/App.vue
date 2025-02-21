<template>
  <div class="app">
    <header>
      <h1>Game Hub</h1>
      <nav>
        <router-link to="/woordrazernij">Woordrazernij</router-link>
        <router-link to="/tafel-razernij">Tafel Razernij</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
header {
  margin-bottom: 2rem;
}
h1 {
  color: #2c3e50;
  font-size: 2.5rem;
}
nav {
  margin-bottom: 1rem;
}
nav a {
  margin: 0 1rem;
  text-decoration: none;
  color: #42b983;
}
nav a.router-link-exact-active {
  font-weight: bold;
}
</style>
