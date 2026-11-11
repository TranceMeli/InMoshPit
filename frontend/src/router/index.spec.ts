import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import router from "./index";

describe("application router", () => {
  beforeEach(() => {
    sessionStorage.clear();
    setActivePinia(createPinia());
  });

  it("redirects the root path to login", async () => {
    await router.push("/");

    expect(router.currentRoute.value.path).toBe("/login");
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
