import { createRouter, createWebHistory } from 'vue-router';
import { routes as tafelRazernijRoutes } from '@/tafel-razernij/router/index';
import { routes as woordRazernijRoutes } from '@/woordrazernij/router';
import WoordRazernijLayout from '@/woordrazernij/WoordRazernijLayout.vue';
import TafelRazernijLayout from '@/tafel-razernij/TafelRazernijLayout.vue';

const routes = [
  {
    path: '/',
    redirect: '/woordrazernij',
  },
  {
    path: '/woordrazernij',
    component: WoordRazernijLayout,
    children: woordRazernijRoutes,
  },
  {
    path: '/tafel-razernij',
    component: TafelRazernijLayout,
    children: tafelRazernijRoutes,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
