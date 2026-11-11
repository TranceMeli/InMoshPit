import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import App from "./App.vue";
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";

describe("App", () => {
  it("renders the shared header, routed content area, and footer", () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: { template: "<div class='router-view-stub' />" },
          RouterLink: { template: "<a><slot /></a>" },
        },
      },
    });

    expect(wrapper.findComponent(AppHeader).exists()).toBe(true);
    expect(wrapper.find(".app-content .router-view-stub").exists()).toBe(true);
    expect(wrapper.findComponent(AppFooter).exists()).toBe(true);
  });
});
