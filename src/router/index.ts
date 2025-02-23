import { createRouter, createWebHistory } from "vue-router";
import { routes as tafelRazernijRoutes } from "@/tafel-razernij/router/index";
import { routes as woordRazernijRoutes } from "@/woordrazernij/router";
import WoordRazernijLayout from "@/woordrazernij/WoordRazernijLayout.vue";
import TafelRazernijLayout from "@/tafel-razernij/TafelRazernijLayout.vue";
import WoordNavigation from "@/woordrazernij/components/WoordNavigation.vue";
import TafelNavigation from "@/tafel-razernij/components/TafelNavigation.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/LandingPage.vue"),
  },
  {
    path: "/woordrazernij",
    children: woordRazernijRoutes,
    components: {
      default: WoordRazernijLayout,
      navigation: WoordNavigation,
    },
  },
  {
    path: "/tafel-razernij",
    children: tafelRazernijRoutes,
    components: {
      default: TafelRazernijLayout,
      navigation: TafelNavigation,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
