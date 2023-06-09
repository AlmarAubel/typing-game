import { createRouter, createWebHistory } from "vue-router";
import GameScreen from "@/components/GameScreen.vue";
import ObtainedPokemons from "@/components/ObtainedPokemons.vue";
import Pokemon from "@/components/Pokemon.vue";
import PromoText from "@/components/WelcomeScreen.vue";
import NewGame from "@/components/NewGame.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: PromoText,
  },
  {
    path: "/nieuwspel",
    name: "NewGame",
    component: NewGame,
  },
  {
    path: "/game",
    name: "GameScreen",
    component: GameScreen,
  },
  {
    path: "/shop",
    name: "shop",
    component: Pokemon,
  },
  {
    path: "/inventory",
    name: "ObtainedPokemons",
    component: ObtainedPokemons,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
