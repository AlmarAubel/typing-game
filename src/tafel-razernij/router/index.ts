import { createRouter, createWebHistory } from "vue-router";
import TableSelect from "../views/TableSelect.vue";
import GameView from "../views/GameViewer.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: TableSelect,
    },
    {
      path: "/game/:table",
      name: "game",
      component: GameView,
    },
  ],
});

// Expliciet exporteren als default
export default router;
