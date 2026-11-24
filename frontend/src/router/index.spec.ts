import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import router from "./index";

describe("application router", () => {
  beforeEach(() => {
    sessionStorage.clear();
    setActivePinia(createPinia());
  });

  it("shows the home page at the root path", async () => {
    await router.push("/");

    expect(router.currentRoute.value.path).toBe("/");
    expect(router.currentRoute.value.name).toBe("home");
  });

  it("resolves the search page", async () => {
    await router.push({ name: "search", query: { q: "iron" } });

    expect(router.currentRoute.value.path).toBe("/search");
    expect(router.currentRoute.value.query.q).toBe("iron");
  });

  it("marks the watch pages for the compact navigation", async () => {
    await router.push("/streams/some-stream");
    expect(router.currentRoute.value.meta.compactNav).toBe(true);

    await router.push("/videos/some-video");
    expect(router.currentRoute.value.meta.compactNav).toBe(true);

    await router.push("/events");
    expect(router.currentRoute.value.meta.compactNav).toBeUndefined();
  });

  it("redirects unauthenticated users away from the dashboard", async () => {
    await router.push("/dashboard");

    expect(router.currentRoute.value.name).toBe("login");
  });

  it("allows authenticated users to open the dashboard", async () => {
    sessionStorage.setItem("access", "test-access-token");

    await router.push("/dashboard");

    expect(router.currentRoute.value.path).toBe("/dashboard");
  });

  it("resolves public discovery and event routes", async () => {
    for (const path of [
      "/artists",
      "/bands",
      "/events",
      "/events/summer-show",
      "/videos",
      "/videos/live-show",
      "/impressum",
    ]) {
      await router.push(path);
      expect(router.currentRoute.value.path).toBe(path);
    }
  });
});
