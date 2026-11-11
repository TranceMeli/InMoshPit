import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import AppHeader from "./AppHeader.vue";
import { getLocale } from "../i18n";

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

  it("switches the language between German and English", async () => {
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

    expect(wrapper.get("nav").text()).toContain("Registrieren");

    const buttons = wrapper.findAll(".language-option");
    expect(buttons.map((b) => b.text())).toEqual(["DE", "EN"]);
    expect(buttons[0].attributes("aria-pressed")).toBe("true");

    await buttons[1].trigger("click");

    expect(getLocale()).toBe("en");
    expect(wrapper.get("nav").text()).toContain("Sign up");
    expect(wrapper.get("nav").text()).not.toContain("Registrieren");
    expect(wrapper.findAll(".language-option")[1].attributes("aria-pressed")).toBe("true");
  });
});
