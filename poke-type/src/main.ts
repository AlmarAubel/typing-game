import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import "bulma/css/bulma.min.css";
const pinia = createPinia();
createApp(App).use(pinia).mount("#app");
