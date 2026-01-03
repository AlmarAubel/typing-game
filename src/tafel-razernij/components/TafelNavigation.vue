<template>
  <div class="flex items-center space-x-4">
    <NavLink :to="{ name: 'tafel-home' }">🎲 Klassiek</NavLink>
    <NavLink :to="{ name: 'tafel-home-v2' }">🚀 V2 (Punten)</NavLink>
  </div>
</template>

<script setup lang="ts">
import NavLink from "../../components/NavLink.vue";
</script>
