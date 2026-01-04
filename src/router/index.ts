import { createRouter, createWebHistory } from "vue-router";
import { routes as tafelRazernijRoutes } from "@/tafel-razernij/router/index";
import { routes as woordRazernijRoutes } from "@/woordrazernij/router";
import voetbalRazernijRoutes from "@/voetbal-razernij/router/index";
import WoordRazernijLayout from "@/woordrazernij/WoordRazernijLayout.vue";
import TafelRazernijLayout from "@/tafel-razernij/TafelRazernijLayout.vue";
import VoetbalRazernijLayout from "@/voetbal-razernij/VoetbalRazernijLayout.vue";
import WoordNavigation from "@/woordrazernij/components/WoordNavigation.vue";
import TafelNavigation from "@/tafel-razernij/components/TafelNavigation.vue";
import VoetbalNavigation from "@/voetbal-razernij/components/VoetbalNavigation.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/LandingPage.vue"),
    meta: { title: "Start" },
  },
  {
    path: "/shop",
    name: "shared-shop",
    component: () => import("@/components/SharedShop.vue"),
    meta: { title: "Shop" },
  },
  {
    path: "/inventory",
    name: "shared-inventory",
    component: () => import("@/woordrazernij/components/ObtainedPokemons.vue"),
    meta: { title: "Collectie" },
  },
  {
    path: "/woordrazernij",
    children: woordRazernijRoutes,
    components: {
      default: WoordRazernijLayout,
      navigation: WoordNavigation,
    },
    meta: { title: "Woord Razernij" },
  },
  {
    path: "/tafel-razernij",
    children: tafelRazernijRoutes,
    components: {
      default: TafelRazernijLayout,
      navigation: TafelNavigation,
    },
    meta: { title: "Tafel Razernij" },
  },
  {
    path: "/voetbal-razernij",
    children: voetbalRazernijRoutes,
    components: {
      default: VoetbalRazernijLayout,
      navigation: VoetbalNavigation,
    },
    meta: { title: "Voetbal Razernij" },
  },
  {
    path: "/parent-dashboard",
    name: "parent-dashboard",
    component: () => import("@/components/ParentDashboard.vue"),
    meta: { title: "Ouderportaal" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Update document title based on route
router.beforeEach((to) => {
  let title = "Spel Razernij";

  if (to.meta.title) {
    if (typeof to.meta.title === "function") {
      title = to.meta.title(to);
    } else {
      title = to.meta.title as string;
    }
  }

  document.title = "Spel Razernij - " + title;
});

export default router;
