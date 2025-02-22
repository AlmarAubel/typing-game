<template>
  <section class="max-w-2xl mx-auto p-6">
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <label class="font-medium">Woorden lijst</label>
        <div class="md:col-span-2">
          <select v-model="settings.selectedWordList" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="wordList in Object.keys(settings.wordLists)" :key="wordList" :value="wordList" :selected="settings.selectedWordList === wordList">
              {{ wordList }}
            </option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <label class="font-medium">Spel duur in seconden</label>
        <div class="md:col-span-2">
          <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" v-model="settings.gameDurationInSec" type="number" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <label class="font-medium">Moeilijkheid</label>
        <div class="md:col-span-2">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(value, key) in settings.difficulties"
              :key="key"
              :class="['px-4 py-2 rounded-md transition-colors', settings.difficulty === key ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300']"
              @click.prevent="settings.difficulty = key"
              :value="key"
            >
              {{ key }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <button class="mt-8 w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors font-medium" @click="onStartButtonClick">Start spel</button>
  </section>
</template>

<script setup lang="ts">
import { useGameSettingsStore } from "@/woordrazernij/store/gameSettingsStore";
import { useRouter } from "vue-router";

const settings = useGameSettingsStore();
const router = useRouter();
const onStartButtonClick = () => {
  router.push({ name: "GameScreen" });
};
</script>

<style scoped></style>
