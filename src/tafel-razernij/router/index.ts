import TableSelect from "../views/TableSelect.vue";
import GameView from "../views/GameViewer.vue";
import TableSelectV2 from "../views/TableSelectV2.vue";
import GameViewerV2 from "../components/GameViewerV2.vue";

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
    path: "v2",
    name: "tafel-home-v2",
    component: TableSelectV2,
  },
  {
    path: "v2/game/:table",
    name: "tafel-game-v2",
    component: GameViewerV2,
  },
];
