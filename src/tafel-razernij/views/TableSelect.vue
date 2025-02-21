<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const practiceType = ref('multiple-choice')
const isRandom = ref(false)
const tables = Array.from({ length: 10 }, (_, i) => i + 1)

const selectTable = (table: number) => {
  router.push({ 
    name: 'tafel-game', 
    params: { table },
    query: { 
      type: practiceType.value,
      random: isRandom.value ? '1' : '0'
    }
  })
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <h2 class="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
      Kies een tafel om te oefenen
    </h2>

    <div class="bg-white rounded-2xl shadow-lg p-6 mb-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <label class="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer group hover:bg-gray-100 transition-colors">
          <input 
            type="radio" 
            v-model="practiceType" 
            value="multiple-choice"
            class="hidden" 
          >
          <span class="flex items-center space-x-3">
            <span class="text-2xl">🎯</span>
            <span class="font-medium">Multiple Choice</span>
          </span>
        </label>

        <label class="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer group hover:bg-gray-100 transition-colors">
          <input 
            type="radio" 
            v-model="practiceType" 
            value="open"
            class="hidden"
          >
          <span class="flex items-center space-x-3">
            <span class="text-2xl">✏️</span>
            <span class="font-medium">Open Antwoorden</span>
          </span>
        </label>
      </div>
      
      <label class="flex items-center space-x-3 p-4">
        <input 
          type="checkbox" 
          v-model="isRandom"
          class="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
        >
        <span class="font-medium">Door elkaar</span>
      </label>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <button
        v-for="table in tables"
        :key="table"
        @click="selectTable(table)"
        class="aspect-square rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white p-4 hover:from-purple-600 hover:to-purple-800 transition-colors shadow-md hover:shadow-lg flex flex-col items-center justify-center"
      >
        <span class="text-3xl font-bold mb-2">{{ table }}</span>
        <span class="text-sm">Tafel van {{ table }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

* {
  font-family: 'Roboto', sans-serif;
}

.table-select {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  font-size: 2.5rem;
  background: linear-gradient(45deg, #FF4D4D, #FF8F8F);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 3rem;
}

.options-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 3rem;
}

.practice-type {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.radio-label {
  cursor: pointer;
  font-size: 1rem;
}

.radio-label input {
  display: none;
}

.radio-custom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f5f5f5;
  transition: all 0.2s;
  font-size: 1rem;
}

.radio-label input:checked + .radio-custom {
  background: #4CAF50;
  color: white;
}

.radio-icon {
  font-style: normal;
  font-size: 1.2rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-size: 1rem;
}

.toggle-custom {
  position: relative;
  width: 50px;
  height: 26px;
  background: #f0f0f0;
  border-radius: 13px;
  transition: all 0.3s;
}

.toggle-custom::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle-label input {
  display: none;
}

.toggle-label input:checked + .toggle-custom {
  background: #4CAF50;
}

.toggle-label input:checked + .toggle-custom::after {
  transform: translateX(24px);
}

.table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.table-button {
  position: relative;
  height: 120px;
  border: none;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.table-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(45deg, #FF4D4D, #FF8F8F);
  transform: scaleX(0);
  transition: transform 0.3s;
}

.table-button:hover {
  transform: translateY(-4px);
}

.table-button:hover::before {
  transform: scaleX(1);
}

.table-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.table-text {
  font-size: 1rem;
  color: #666;
}
</style>
