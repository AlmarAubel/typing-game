import TableSelect from "../views/TableSelect.vue";
import GameView from "../views/GameViewer.vue";
import TableSelectV2 from "../views/TableSelectV2.vue";
import GameViewerV2 from "../components/GameViewerV2.vue";

export const routes = [
  {
    path: "",
    name: "tafel-home",
    component: TableSelect,
    meta: { title: "Tafel Razernij" },
  },
  {
    path: "game/:table",
    name: "tafel-game",
    component: GameView,
    meta: { title: "Tafel Razernij Spel" },
  },
  {
    path: "v2",
    name: "tafel-home-v2",
    component: TableSelectV2,
    meta: { title: "Tafel Razernij" },
  },
  {
    path: "v2/game/:table",
    name: "tafel-game-v2",
    component: GameViewerV2,
    meta: {
      title: (route: any) => `Tafel van ${route.params.table}`,
    },
  },
];
