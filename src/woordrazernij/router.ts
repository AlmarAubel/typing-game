import GameScreen from "@/woordrazernij/components/GameScreen.vue";
import Pokemon from "@/woordrazernij/components/Pokemon.vue";
import NewGame from "@/woordrazernij/components/NewGame.vue";

export const routes = [
  {
    path: "",
    name: "woord-home",
    redirect: { name: "woord-newgame" },
  },
  {
    path: "nieuwspel",
    name: "woord-newgame",
    component: NewGame,
  },
  {
    path: "game",
    name: "woord-gamescreen",
    component: GameScreen,
  },
  {
    path: "shop-legacy",
    name: "woord-shop-legacy",
    component: Pokemon,
  },
];
