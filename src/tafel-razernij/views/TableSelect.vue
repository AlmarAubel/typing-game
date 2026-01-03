<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const practiceType = ref("multiple-choice");
const isRandom = ref(false);
const tables = Array.from({ length: 10 }, (_, i) => i + 1);
const selectedTables = ref<number[]>([]);

const selectTable = (table: number) => {
  const index = selectedTables.value.indexOf(table);
  if (index === -1) {
    selectedTables.value.push(table);
  } else {
    selectedTables.value.splice(index, 1);
  }
};

const startGame = () => {
  if (selectedTables.value.length === 0) return;
  router.push({
    name: "tafel-game",
    params: { table: selectedTables.value.join(",") },
    query: {
      type: practiceType.value,
      random: isRandom.value ? "1" : "0",
    },
  });
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-8 font-roboto">
    <h2
      class="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent"
    >
      Kies een tafel om te oefenen
    </h2>

    <div class="bg-white rounded-2xl shadow-lg p-6 mb-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <label
          :class="[
            'flex items-center p-4 rounded-xl cursor-pointer group transition-all duration-200',
            practiceType === 'multiple-choice'
              ? 'bg-purple-100 border-2 border-purple-500 shadow-md'
              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100',
          ]"
        >
          <input
            type="radio"
            v-model="practiceType"
            value="multiple-choice"
            class="hidden"
          />
          <div class="flex items-center justify-between w-full">
            <span class="flex items-center space-x-3">
              <span class="text-2xl">🎯</span>
              <span class="font-medium">Multiple Choice</span>
            </span>
            <span
              :class="[
                'w-4 h-4 rounded-full border-2',
                practiceType === 'multiple-choice'
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300',
              ]"
            ></span>
          </div>
        </label>

        <label
          :class="[
            'flex items-center p-4 rounded-xl cursor-pointer group transition-all duration-200',
            practiceType === 'open'
              ? 'bg-purple-100 border-2 border-purple-500 shadow-md'
              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100',
          ]"
        >
          <input
            type="radio"
            v-model="practiceType"
            value="open"
            class="hidden"
          />
          <div class="flex items-center justify-between w-full">
            <span class="flex items-center space-x-3">
              <span class="text-2xl">✏️</span>
              <span class="font-medium">Open Antwoorden</span>
            </span>
            <span
              :class="[
                'w-4 h-4 rounded-full border-2',
                practiceType === 'open'
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300',
              ]"
            ></span>
          </div>
        </label>
      </div>

      <label
        class="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer"
      >
        <input
          type="checkbox"
          v-model="isRandom"
          class="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-2"
        />
        <span class="font-medium text-gray-700">Door elkaar</span>
      </label>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <button
        v-for="table in tables"
        :key="table"
        @click="selectTable(table)"
        :class="[
          'rounded-xl p-4 transition-colors shadow-md hover:shadow-lg flex flex-col items-center justify-center transform hover:-translate-y-1 duration-200',
          selectedTables.includes(table)
            ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white'
            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300',
        ]"
      >
        <span class="text-3xl font-bold mb-2">{{ table }}</span>
        <span class="">Tafel van {{ table }}</span>
      </button>
    </div>

    <div class="mt-8 text-center">
      <button
        @click="startGame"
        :disabled="selectedTables.length === 0"
        class="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl text-xl font-bold hover:from-purple-600 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        Start Oefenen
      </button>
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
</style>
