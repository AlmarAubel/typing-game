<template>
  <div class="min-h-screen flex flex-col">
    <main-navigation />
    <main class="flex-1 pt-16">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainNavigation from '@/components/MainNavigation.vue';
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
}
</style>
