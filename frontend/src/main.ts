import { createApp } from "vue";
import { createPinia } from "pinia";
import "./assets/styles/global.css";

import App from "./App.vue";
import router from "./router";
import { i18n } from "./i18n";
import { registerAuthHooks } from "./services/api";
import { useAuthStore } from "./stores/auth";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

// Verbindet den API-Client (automatischer Token-Refresh) mit Store und Router.
const authStore = useAuthStore();

registerAuthHooks({
  onTokensRefreshed: (access, refresh) => authStore.setTokens(access, refresh),
  onSessionExpired: () => {
    authStore.logout();

    const current = router.currentRoute.value;

    router.push({
      name: "login",
      query: {
        reason: "expired",
        ...(current.meta.requiresAuth ? { redirect: current.fullPath } : {}),
      },
    });
  },
});

app.mount("#app");
