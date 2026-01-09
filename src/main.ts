import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
const app = createApp(App);
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);

app.mount("#app");
