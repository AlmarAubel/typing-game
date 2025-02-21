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