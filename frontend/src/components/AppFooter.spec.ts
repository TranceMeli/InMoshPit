import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppFooter from "./AppFooter.vue";

describe("AppFooter", () => {
  it("renders discovery and information links", () => {
    const wrapper = mount(AppFooter, {
      global: {
        stubs: {
          RouterLink: {
            props: ["to"],
            template: "<a :href='to'><slot /></a>",
          },
        },
      },
    });

    expect(wrapper.find('a[href="/artists"]').exists()).toBe(true);
    expect(wrapper.find('a[href="/bands"]').exists()).toBe(true);
    expect(wrapper.find('a[href="/impressum"]').exists()).toBe(true);
    expect(wrapper.find('a[href="/datenschutz"]').exists()).toBe(true);
    expect(wrapper.find('a[href="/kontakt"]').exists()).toBe(true);
  });

  it("renders the current year and demo address notice", () => {
    const wrapper = mount(AppFooter);

    expect(wrapper.text()).toContain(`© ${new Date().getFullYear()} InMoshPit`);
    expect(wrapper.text()).toContain("Fiktive Entwicklungsanschrift");
  });
});
