import GameScreen from "@/woordrazernij/components/GameScreen.vue";
import ObtainedPokemons from "@/woordrazernij/components/ObtainedPokemons.vue";
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
    path: "shop",
    name: "woord-shop",
    component: Pokemon,
  },
  {
    path: "inventory",
    name: "woord-obtainedpokemons",
    component: ObtainedPokemons,
  },
];
