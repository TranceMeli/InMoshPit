import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppHeader from "./AppHeader.vue";

describe("AppHeader", () => {
  it("renders brand and primary navigation links", () => {
    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          RouterLink: {
            props: ["to"],
            template: "<a :href='to'><slot /></a>",
          },
        },
      },
    });

    expect(wrapper.find(".brand").attributes("href")).toBe("/artists");
    expect(wrapper.get("nav").text()).toContain("Artists");
    expect(wrapper.get("nav").text()).toContain("Login");
    expect(wrapper.get("nav").text()).toContain("Registrieren");
  });
});
