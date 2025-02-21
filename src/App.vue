<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}
</style>
