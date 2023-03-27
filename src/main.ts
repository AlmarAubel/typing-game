import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import "bulma/css/bulma.min.css";
import router from "./router";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)
createApp(App).use(pinia).use(router).mount("#app");
