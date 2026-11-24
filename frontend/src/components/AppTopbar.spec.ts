import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

import { getLocale, setLocale } from "../i18n";
import { useAuthStore } from "../stores/auth";
import { useLayoutStore } from "../stores/layout";
import { createTestRouter } from "../test/helpers";
import AppTopbar from "./AppTopbar.vue";

const flags = await vi.hoisted(async () => {
  const { ref } = await import("vue");

  return { isWide: ref(true), isMobile: ref(false) };
});

vi.mock("../composables/useBreakpoint", () => ({
  useBreakpoint: () => flags,
  isWideNow: () => flags.isWide.value,
}));

async function mountTopbar(options: { path?: string; loggedIn?: boolean } = {}) {
  if (options.loggedIn) {
    sessionStorage.setItem("access", "token");
  }

  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createTestRouter();
  await router.push(options.path ?? "/");
  await router.isReady();

  const wrapper = mount(AppTopbar, {
    attachTo: document.body,
    global: { plugins: [pinia, router] },
  });

  return { wrapper, router, layout: useLayoutStore(), auth: useAuthStore() };
}

describe("AppTopbar", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    setLocale("de");
    flags.isWide.value = true;
    flags.isMobile.value = false;
    document.body.innerHTML = "";
  });

  describe("brand and language", () => {
    it("links the logo to the home page", async () => {
      const { wrapper } = await mountTopbar({ path: "/events" });

      expect(wrapper.get(".brand").attributes("href")).toBe("/");
      expect(wrapper.get(".brand").text()).toContain("InMoshPit");
    });

    it("switches the language", async () => {
      const { wrapper } = await mountTopbar();

      await wrapper.findAll(".language-option")[1].trigger("click");

      expect(getLocale()).toBe("en");
      expect(wrapper.get(".brand").attributes("aria-label")).toBe("Go to the home page");
    });
  });

  describe("menu button", () => {
    it("collapses and expands the sidebar on wide pages", async () => {
      const { wrapper, layout } = await mountTopbar();

      await wrapper.get("[aria-label='Menü ein- oder ausklappen']").trigger("click");

      expect(layout.preference).toBe("rail");
      expect(layout.drawerOpen).toBe(false);
    });

    it("opens the drawer on narrow pages", async () => {
      flags.isWide.value = false;
      const { wrapper, layout } = await mountTopbar();

      await wrapper.get("[aria-label='Menü ein- oder ausklappen']").trigger("click");

      expect(layout.drawerOpen).toBe(true);
      expect(layout.preference).toBe("expanded");
    });

    it("opens the drawer on watch pages", async () => {
      const { wrapper, layout } = await mountTopbar({ path: "/streams/some-stream" });

      await wrapper.get("[aria-label='Menü ein- oder ausklappen']").trigger("click");

      expect(layout.drawerOpen).toBe(true);
    });

    it("reports the drawer state to assistive technology", async () => {
      const { wrapper, layout } = await mountTopbar();

      expect(wrapper.get("[aria-label='Menü ein- oder ausklappen']").attributes("aria-expanded")).toBe("false");

      layout.drawerOpen = true;
      await flushPromises();

      expect(wrapper.get("[aria-label='Menü ein- oder ausklappen']").attributes("aria-expanded")).toBe("true");
    });
  });

  describe("search", () => {
    it("searches on submit and trims the term", async () => {
      const { wrapper, router } = await mountTopbar();

      await wrapper.get("input[type='search']").setValue("  iron pit ");
      await wrapper.get("form").trigger("submit");
      await flushPromises();

      expect(router.currentRoute.value.name).toBe("search");
      expect(router.currentRoute.value.query.q).toBe("iron pit");
    });

    it("does nothing for an empty term", async () => {
      const { wrapper, router } = await mountTopbar();

      await wrapper.get("input[type='search']").setValue("   ");
      await wrapper.get("form").trigger("submit");
      await flushPromises();

      expect(router.currentRoute.value.name).toBe("home");
    });

    it("shows the current search term and follows the route", async () => {
      const { wrapper, router } = await mountTopbar({ path: "/search?q=lena" });

      expect((wrapper.get("input[type='search']").element as HTMLInputElement).value).toBe("lena");

      await router.push("/search?q=iron");
      await flushPromises();

      expect((wrapper.get("input[type='search']").element as HTMLInputElement).value).toBe("iron");
    });

    it("is a labelled search landmark", async () => {
      const { wrapper } = await mountTopbar();

      expect(wrapper.get("form").attributes("role")).toBe("search");
      expect(wrapper.get("input[type='search']").attributes("aria-label")).toBe("Suche");
    });

    it("opens as its own view on phones and closes again", async () => {
      flags.isMobile.value = true;
      const { wrapper } = await mountTopbar();

      expect(wrapper.find(".topbar--search").exists()).toBe(false);

      await wrapper.get("[aria-label='Suche öffnen']").trigger("click");
      expect(wrapper.find(".topbar--search").exists()).toBe(true);

      await wrapper.get("[aria-label='Suche schließen']").trigger("click");
      expect(wrapper.find(".topbar--search").exists()).toBe(false);
    });

    it("has no extra search button on larger screens", async () => {
      const { wrapper } = await mountTopbar();

      expect(wrapper.find("[aria-label='Suche öffnen']").exists()).toBe(false);
    });
  });

  describe("account", () => {
    it("offers login and registration when signed out", async () => {
      const { wrapper } = await mountTopbar();

      expect(wrapper.get("a[href='/login']").text()).toContain("Login");
      expect(wrapper.get("a[href='/register']").text()).toContain("Registrieren");
      expect(wrapper.find("[aria-label='Kontomenü']").exists()).toBe(false);
    });

    it("shows an account menu instead when signed in", async () => {
      const { wrapper } = await mountTopbar({ loggedIn: true });

      expect(wrapper.find("a[href='/login']").exists()).toBe(false);
      expect(wrapper.find("a[href='/register']").exists()).toBe(false);

      const button = wrapper.get("[aria-label='Kontomenü']");
      expect(button.attributes("aria-expanded")).toBe("false");
      expect(wrapper.find("[role='menu']").exists()).toBe(false);

      await button.trigger("click");

      expect(button.attributes("aria-expanded")).toBe("true");
      expect(wrapper.get("[role='menu'] a").attributes("href")).toBe("/dashboard");
    });

    it("logs out, closes the menu and returns to the home page", async () => {
      const { wrapper, router, auth } = await mountTopbar({ path: "/dashboard", loggedIn: true });

      await wrapper.get("[aria-label='Kontomenü']").trigger("click");
      await wrapper.get("button[role='menuitem']").trigger("click");
      await flushPromises();

      expect(auth.isAuthenticated).toBe(false);
      expect(sessionStorage.getItem("access")).toBeNull();
      expect(router.currentRoute.value.path).toBe("/");
      expect(wrapper.find("[role='menu']").exists()).toBe(false);
      expect(wrapper.find("a[href='/login']").exists()).toBe(true);
    });

    it("closes the menu with Escape", async () => {
      const { wrapper } = await mountTopbar({ loggedIn: true });
      await wrapper.get("[aria-label='Kontomenü']").trigger("click");

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await flushPromises();

      expect(wrapper.find("[role='menu']").exists()).toBe(false);
    });

    it("closes the menu when clicking elsewhere", async () => {
      const { wrapper } = await mountTopbar({ loggedIn: true });
      await wrapper.get("[aria-label='Kontomenü']").trigger("click");

      document.body.click();
      await flushPromises();

      expect(wrapper.find("[role='menu']").exists()).toBe(false);
    });

    it("keeps the menu open when clicking inside it", async () => {
      const { wrapper } = await mountTopbar({ loggedIn: true });
      await wrapper.get("[aria-label='Kontomenü']").trigger("click");

      await wrapper.get("[role='menu']").trigger("click");

      expect(wrapper.find("[role='menu']").exists()).toBe(true);
    });

    it("closes the menu after navigating", async () => {
      const { wrapper, router } = await mountTopbar({ loggedIn: true });
      await wrapper.get("[aria-label='Kontomenü']").trigger("click");

      await router.push("/events");
      await flushPromises();

      expect(wrapper.find("[role='menu']").exists()).toBe(false);
    });
  });
});
