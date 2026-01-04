import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/voetbal-razernij",
    redirect: "/voetbal-razernij/table-select",
  },
  {
    path: "/voetbal-razernij/table-select",
    name: "VoetbalTableSelect",
    component: () => import("../views/TableSelect.vue"),
  },
  {
    path: "/voetbal-razernij/game/:table",
    name: "VoetbalGame",
    component: () => import("../views/GameSession.vue"),
    props: (route) => ({ table: parseInt(route.params.table as string) }),
  },
  {
    path: "/voetbal-razernij/club-store/:clubId",
    name: "VoetbalClubStore",
    component: () => import("../views/ClubStore.vue"),
    props: (route) => ({ clubId: parseInt(route.params.clubId as string) }),
  },
  {
    path: "/voetbal-razernij/collection",
    name: "VoetbalCollection",
    component: () => import("../views/Collection.vue"),
  },
  {
    path: "/voetbal-razernij/team-builder",
    name: "VoetbalTeamBuilder",
    component: () => import("../views/TeamBuilder.vue"),
  },
  {
    path: "/voetbal-razernij/pack-opening/:clubId/:packType",
    name: "VoetbalPackOpening",
    component: () => import("../views/PackOpening.vue"),
    props: (route) => ({
      clubId: parseInt(route.params.clubId as string),
      packType: route.params.packType as string,
    }),
  },
];

export default routes;
