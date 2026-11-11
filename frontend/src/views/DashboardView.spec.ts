import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "../stores/auth";
import DashboardView from "./DashboardView.vue";

const push = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push }),
}));

describe("DashboardView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("shows the signed-in state", () => {
    const wrapper = mount(DashboardView);

    expect(wrapper.text()).toContain("Du bist angemeldet.");
    expect(wrapper.find("button").text()).toBe("Abmelden");
  });

  it("logs out and navigates to login", async () => {
    const authStore = useAuthStore();
    const logout = vi.spyOn(authStore, "logout");
    const wrapper = mount(DashboardView);

    await wrapper.find("button").trigger("click");

    expect(logout).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith("/login");
  });
});
