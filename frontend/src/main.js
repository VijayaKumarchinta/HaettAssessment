import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import App from "./App.vue";
import PartnerPage from "./pages/PartnerPage.vue";
import "./assets/styles/global.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/partner" },
    { path: "/partner", component: PartnerPage },
  ],
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(Toast, { timeout: 3000, position: "top-right" });
app.mount("#app");
