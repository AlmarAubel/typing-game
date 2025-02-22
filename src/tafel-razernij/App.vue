<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="app">
    <header>
      <h1>Tafel Razernij</h1>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

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
</style>
