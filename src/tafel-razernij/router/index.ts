import TableSelect from "../views/TableSelect.vue";
import GameView from "../views/GameViewer.vue";

export const routes = [
  {
    path: "",
    name: "tafel-home",
    component: TableSelect,
  },
  {
    path: "game/:table",
    name: "tafel-game",
    component: GameView,
  },
  {
    path: "inventory",
    name: "tafel-inventory",
    component: () => import("../views/InventoryView.vue"),
  }
];
