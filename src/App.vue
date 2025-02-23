<template>
  <div class="h-screen flex flex-col">
    <main-navigation>
      <router-view name="navigation"></router-view>
    </main-navigation>
   
    <main class="flex-1 pt-16" :class="{ 'overflow-hidden': isTafelGame }">
      <router-view></router-view>
    </main>
  </div>
</template> 

<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import MainNavigation from "@/components/MainNavigation.vue";
import { computed } from "vue";

const route = useRoute();
const isTafelGame = computed(() => route.name === "tafel-game");
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
