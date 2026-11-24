import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";

import App from "./App.vue";
import AppSidebar from "./components/AppSidebar.vue";
import AppTopbar from "./components/AppTopbar.vue";

describe("App", () => {
  it("renders the topbar, the sidebar and a content area with the routed view", () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterView: { template: "<div class='router-view-stub' />" },
          RouterLink: { template: "<a><slot /></a>" },
          AppTopbar: true,
          AppSidebar: true,
          BottomNav: true,
        },
      },
    });

    expect(wrapper.findComponent(AppTopbar).exists()).toBe(true);
    expect(wrapper.findComponent(AppSidebar).exists()).toBe(true);
    expect(wrapper.find("#content .router-view-stub").exists()).toBe(true);
  });

  it("offers a skip link to the content", () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterView: true,
          AppTopbar: true,
          AppSidebar: true,
          BottomNav: true,
        },
      },
    });

    expect(wrapper.get(".skip-link").attributes("href")).toBe("#content");
  });
});
