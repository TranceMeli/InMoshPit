import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

import { useLayoutStore } from "../stores/layout";
import { createTestRouter } from "../test/helpers";
import BottomNav from "./BottomNav.vue";

const flags = await vi.hoisted(async () => {
  const { ref } = await import("vue");

  return { isWide: ref(true), isMobile: ref(true) };
});

vi.mock("../composables/useBreakpoint", () => ({
  useBreakpoint: () => flags,
  isWideNow: () => flags.isWide.value,
}));

async function mountNav(path = "/", loggedIn = false) {
  if (loggedIn) {
    sessionStorage.setItem("access", "token");
  }

  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createTestRouter();
  await router.push(path);
  await router.isReady();

  return { wrapper: mount(BottomNav, { global: { plugins: [pinia, router] } }), layout: useLayoutStore() };
}

describe("BottomNav", () => {
  beforeEach(() => {
    sessionStorage.clear();
    flags.isMobile.value = true;
  });

  it("only exists on phones", async () => {
    flags.isMobile.value = false;

    const { wrapper } = await mountNav();

    expect(wrapper.find("nav").exists()).toBe(false);
  });

  it("shows the four main sections and the login entry when signed out", async () => {
    const { wrapper } = await mountNav();

    const items = wrapper.findAll(".bottom-item");

    expect(items.map((i) => i.text())).toEqual(["Start", "Live", "Events", "Videos", "Login"]);
    expect(items.map((i) => i.attributes("href"))).toEqual([
      "/",
      "/streams",
      "/events",
      "/videos",
      "/login",
    ]);
  });

  it("shows the dashboard instead of login when signed in", async () => {
    const { wrapper } = await mountNav("/", true);

    const last = wrapper.findAll(".bottom-item")[4];

    expect(last.text()).toBe("Dashboard");
    expect(last.attributes("href")).toBe("/dashboard");
  });

  it("marks the current section", async () => {
    const { wrapper } = await mountNav("/videos");

    expect(wrapper.get("[href='/videos']").attributes("aria-current")).toBe("page");
    expect(wrapper.get("[href='/']").attributes("aria-current")).toBeUndefined();
  });

  it("shows the live count on the live entry", async () => {
    const { wrapper, layout } = await mountNav();

    expect(wrapper.find(".bottom-badge").exists()).toBe(false);

    layout.liveCount = 3;
    await flushPromises();

    expect(wrapper.get(".bottom-badge").text()).toBe("3");
  });

  it("is labelled as navigation", async () => {
    const { wrapper } = await mountNav();

    expect(wrapper.get("nav").attributes("aria-label")).toBe("Navigation unten");
  });
});
