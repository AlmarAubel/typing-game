<template>
  <main-navigation />
  <div class="section">
    <div class="pokemon-app container">
      <router-view></router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import MainNavigation from "./MainNavigation.vue";
</script>
