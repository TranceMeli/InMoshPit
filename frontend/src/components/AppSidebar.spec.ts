import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

import { createTestRouter } from "../test/helpers";
import { useLayoutStore } from "../stores/layout";
import AppSidebar from "./AppSidebar.vue";

const flags = await vi.hoisted(async () => {
  const { ref } = await import("vue");

  return { isWide: ref(true), isMobile: ref(false) };
});

vi.mock("../composables/useBreakpoint", () => ({
  useBreakpoint: () => flags,
  isWideNow: () => flags.isWide.value,
}));

async function mountSidebar(path = "/") {
  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createTestRouter();
  await router.push(path);
  await router.isReady();

  const wrapper = mount(AppSidebar, { global: { plugins: [pinia, router] } });

  return { wrapper, router, layout: useLayoutStore() };
}

describe("AppSidebar", () => {
  beforeEach(() => {
    localStorage.clear();
    flags.isWide.value = true;
    flags.isMobile.value = false;
  });

  it("lists the main sections with links", async () => {
    const { wrapper } = await mountSidebar();

    const items = wrapper.findAll(".nav-item");

    expect(items.map((i) => i.text())).toEqual([
      "Start",
      "Live",
      "Events",
      "Videos",
      "Artists",
      "Bands",
    ]);
    expect(items.map((i) => i.attributes("href"))).toEqual([
      "/",
      "/streams",
      "/events",
      "/videos",
      "/artists",
      "/bands",
    ]);
  });

  it("marks the current section and its sub pages", async () => {
    const { wrapper } = await mountSidebar("/events");

    expect(wrapper.get("[href='/events']").attributes("aria-current")).toBe("page");
    expect(wrapper.get("[href='/']").attributes("aria-current")).toBeUndefined();
    expect(wrapper.get("[href='/']").classes()).not.toContain("active");
  });

  it("is expanded with the legal links on wide pages", async () => {
    const { wrapper } = await mountSidebar();

    expect(wrapper.get("aside").classes()).toContain("sidebar--expanded");
    expect(wrapper.get(".sidebar-slot").classes()).toContain("sidebar-slot--expanded");
    expect(wrapper.findAll(".legal a").map((a) => a.attributes("href"))).toEqual([
      "/impressum",
      "/datenschutz",
      "/nutzungsbedingungen",
      "/kontakt",
    ]);
    expect(wrapper.get(".legal").text()).toContain(String(new Date().getFullYear()));
  });

  it("collapses to the icon rail when the user chose so", async () => {
    localStorage.setItem("sidebar", "rail");

    const { wrapper } = await mountSidebar();

    expect(wrapper.get("aside").classes()).toContain("sidebar--rail");
    expect(wrapper.find(".legal").exists()).toBe(false);
    // In der Icon-Leiste erklärt ein Tooltip jedes Icon.
    expect(wrapper.get("[href='/events']").attributes("title")).toBe("Events");
  });

  it("is a rail on watch pages regardless of the preference", async () => {
    const { wrapper } = await mountSidebar("/streams/some-stream");

    expect(wrapper.get("aside").classes()).toContain("sidebar--rail");
  });

  it("is a rail on medium screens", async () => {
    flags.isWide.value = false;

    const { wrapper } = await mountSidebar();

    expect(wrapper.get("aside").classes()).toContain("sidebar--rail");
  });

  it("is hidden on phones and reserves no space", async () => {
    flags.isMobile.value = true;

    const { wrapper } = await mountSidebar();

    expect(wrapper.get("aside").attributes("style")).toContain("display: none");
    expect(wrapper.get(".sidebar-slot").classes()).toContain("sidebar-slot--none");
  });

  describe("drawer", () => {
    it("overlays the content with labels and keeps the reserved space", async () => {
      localStorage.setItem("sidebar", "rail");
      const { wrapper, layout } = await mountSidebar();

      layout.drawerOpen = true;
      await flushPromises();

      expect(wrapper.get("aside").classes()).toContain("sidebar--drawer");
      expect(wrapper.find(".backdrop").exists()).toBe(true);
      // Der Platzhalter behält die Breite der Icon-Leiste, der Inhalt springt nicht.
      expect(wrapper.get(".sidebar-slot").classes()).toContain("sidebar-slot--rail");
      expect(wrapper.find(".legal").exists()).toBe(true);
    });

    it("opens on phones even though the sidebar is hidden there", async () => {
      flags.isMobile.value = true;
      const { wrapper, layout } = await mountSidebar();

      layout.drawerOpen = true;
      await flushPromises();

      expect(wrapper.get("aside").attributes("style") ?? "").not.toContain("display: none");
    });

    it("closes when the backdrop is clicked", async () => {
      const { wrapper, layout } = await mountSidebar();
      layout.drawerOpen = true;
      await flushPromises();

      await wrapper.get(".backdrop").trigger("click");

      expect(layout.drawerOpen).toBe(false);
    });

    it("closes with Escape", async () => {
      const { layout } = await mountSidebar();
      layout.drawerOpen = true;
      await flushPromises();

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

      expect(layout.drawerOpen).toBe(false);
    });

    it("closes after navigating", async () => {
      const { router, layout } = await mountSidebar();
      layout.drawerOpen = true;
      await flushPromises();

      await router.push("/events");

      expect(layout.drawerOpen).toBe(false);
    });

    it("moves focus into the drawer when it opens", async () => {
      const { layout } = await mountSidebar();
      const host = document.createElement("div");
      document.body.appendChild(host);

      const pinia = createPinia();
      setActivePinia(pinia);
      const router = createTestRouter();
      await router.push("/");
      await router.isReady();
      const wrapper = mount(AppSidebar, { attachTo: host, global: { plugins: [pinia, router] } });

      useLayoutStore().drawerOpen = true;
      await flushPromises();

      expect(document.activeElement?.getAttribute("href")).toBe("/");

      wrapper.unmount();
      host.remove();
      expect(layout).toBeDefined();
    });
  });

  describe("live badge", () => {
    it("shows the number of live streams with an accessible label", async () => {
      const { wrapper, layout } = await mountSidebar();

      layout.liveCount = 2;
      await flushPromises();

      const badge = wrapper.get(".nav-badge");

      expect(badge.text()).toBe("2");
      expect(badge.attributes("aria-label")).toBe("2 Streams live");
    });

    it("uses the singular for one stream", async () => {
      const { wrapper, layout } = await mountSidebar();

      layout.liveCount = 1;
      await flushPromises();

      expect(wrapper.get(".nav-badge").attributes("aria-label")).toBe("1 Stream live");
    });

    it("is hidden when nothing is live", async () => {
      const { wrapper } = await mountSidebar();

      expect(wrapper.find(".nav-badge").exists()).toBe(false);
    });
  });
});
