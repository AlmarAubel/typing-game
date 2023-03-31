<template>
  <section class="section">
    <div
        class="difficulty-selector container"
    >
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Woorden lijst</label>
        </div>
        <div class="field-body">
          <div class="select is-info">
            <select v-model="settings.selectedWordList">
              <option
                  v-for="wordList in Object.keys(settings.wordLists)"
                  :key="wordList"
                  :value="wordList"
                  :selected="settings.selectedWordList === wordList"
              >
                {{ wordList }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">
            Spel duur in seconden
          </label>
        </div>
        <div class="field-body">
          <input class="input" v-model="settings.gameDurationInSec" type="number"/>
        </div>
      </div>
      <!--        <div>-->
      <!--          <button class="button is-primary" @click="toggleOnscreenKeyboard()">-->
      <!--            Scherm toetsenboard {{ useOnscreenKeyboard ? "️✔" :"❌"  }}-->
      <!--          </button>-->
      <!--        </div>-->
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">
            Moeilijkheid
          </label>
        </div>
        <div class="field-body">
          <div class="select is-info">
            <select v-model="settings.difficulty">
              <option v-for="(value, key) in settings.difficulties" :key="key" :value="key">
                {{ key }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <button class="button is-primary" @click="onStartButtonClick">Start spel</button>
  </section>
</template>

<script setup lang="ts">
import {useGameSettingsStore} from "@/store/gameSettingsStore";
import {useRouter} from "vue-router";

const settings = useGameSettingsStore();
const router = useRouter()
const onStartButtonClick = () => {
  router.push({name: "GameScreen"})
  
};
</script>

<style scoped>

</style>