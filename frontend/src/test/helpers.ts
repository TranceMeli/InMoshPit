import { createMemoryHistory, createRouter } from "vue-router";

const Page = { template: "<div />" };

/** Router mit den Routen, die Layout-Komponenten für Links und Meta brauchen. */
export function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "home", component: Page },
      { path: "/search", name: "search", component: Page },
      { path: "/streams", name: "streams", component: Page },
      { path: "/streams/:slug", name: "stream-detail", component: Page, meta: { compactNav: true } },
      { path: "/events", name: "events", component: Page },
      { path: "/videos", name: "videos", component: Page },
      { path: "/artists", name: "artists", component: Page },
      { path: "/bands", name: "bands", component: Page },
      { path: "/login", name: "login", component: Page },
      { path: "/register", name: "register", component: Page },
      { path: "/dashboard", name: "dashboard", component: Page },
      { path: "/impressum", component: Page },
      { path: "/datenschutz", component: Page },
      { path: "/nutzungsbedingungen", component: Page },
      { path: "/kontakt", component: Page },
    ],
  });
}
