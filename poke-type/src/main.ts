import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import "bulma/css/bulma.min.css";
import router from "./router";

const pinia = createPinia();
createApp(App).use(pinia).use(router).mount("#app");
