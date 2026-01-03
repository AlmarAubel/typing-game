import GameScreen from "@/woordrazernij/components/GameScreen.vue";
import Pokemon from "@/woordrazernij/components/Pokemon.vue";
import NewGame from "@/woordrazernij/components/NewGame.vue";

export const routes = [
  {
    path: "",
    name: "woord-home",
    redirect: { name: "woord-newgame" },
    meta: { title: "Woord Razernij" },
  },
  {
    path: "nieuwspel",
    name: "woord-newgame",
    component: NewGame,
    meta: { title: "Woord Razernij" },
  },
  {
    path: "game",
    name: "woord-gamescreen",
    component: GameScreen,
    meta: { title: "Woord Razernij Spel" },
  },
  {
    path: "shop-legacy",
    name: "woord-shop-legacy",
    component: Pokemon,
    meta: { title: "Woord Razernij Shop" },
  },
];
