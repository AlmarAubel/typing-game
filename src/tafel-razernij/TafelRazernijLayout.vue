<template>
  <main-navigation />
  <div class="py-8">
    <div class="container mx-auto px-4">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import MainNavigation from '@/components/MainNavigation.vue';
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
</style>