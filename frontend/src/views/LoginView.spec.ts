
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia } from "pinia";
import {
  createMemoryHistory,
  createRouter,
} from "vue-router";

import LoginView from "./LoginView.vue";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/login",
        component: LoginView,
      },
      {
        path: "/dashboard",
        component: { template: "<div>Dashboard</div>" },
      },
    ],
  });
}

describe("LoginView", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("should render the login form", async () => {
    const router = createTestRouter();

    await router.push("/login");
    await router.isReady();

    const wrapper = mount(LoginView, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    expect(wrapper.find("h2").text()).toBe("Anmelden");
    expect(wrapper.find("#username").exists()).toBe(true);
    expect(wrapper.find("#password").exists()).toBe(true);
    expect(wrapper.find("button").text()).toBe("Anmelden");
  });

  it("should login and navigate to dashboard", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        access: "test-access-token",
        refresh: "test-refresh-token",
      },
    } as any);

    const router = createTestRouter();

    await router.push("/login");
    await router.isReady();

    const wrapper = mount(LoginView, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    await wrapper.find("#username").setValue("testuser");
    await wrapper.find("#password").setValue("Password123!");
    await wrapper.find("form").trigger("submit");

    await flushPromises();

    expect(api.post).toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe("/dashboard");
  });

  it("should display an error for invalid credentials", async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: {
        status: 401,
      },
    });

    const router = createTestRouter();

    await router.push("/login");
    await router.isReady();

    const wrapper = mount(LoginView, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    await wrapper.find("#username").setValue("testuser");
    await wrapper.find("#password").setValue("wrong-password");
    await wrapper.find("form").trigger("submit");

    await flushPromises();

    expect(wrapper.text()).toContain(
      "Benutzername oder Passwort ist falsch."
    );

    expect(router.currentRoute.value.path).toBe("/login");
  });
});
