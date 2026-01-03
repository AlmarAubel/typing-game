import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { migrateToSharedStore } from "./utils/migrationHelper";

const pinia = createPinia();
const app = createApp(App);
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);

// Perform migration after app initialization
app.mount("#app");

// Run migration in the next tick to ensure stores are ready
setTimeout(() => {
  migrateToSharedStore();
}, 100);
