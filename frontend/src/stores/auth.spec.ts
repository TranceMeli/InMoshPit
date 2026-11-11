
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "./auth";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

describe("Auth Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("should start unauthenticated", () => {
    const authStore = useAuthStore();

    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.accessToken).toBeNull();
    expect(authStore.refreshToken).toBeNull();
  });

  it("should login successfully", async () => {
    const authStore = useAuthStore();

    vi.mocked(api.post).mockResolvedValue({
      data: {
        access: "test-access-token",
        refresh: "test-refresh-token",
      },
    } as any);

    await authStore.login("testuser", "Password123!");

    expect(api.post).toHaveBeenCalledWith(
      "/accounts/token/",
      {
        username: "testuser",
        password: "Password123!",
      }
    );

    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.accessToken).toBe("test-access-token");
    expect(authStore.refreshToken).toBe("test-refresh-token");

    expect(sessionStorage.getItem("access")).toBe("test-access-token");
    expect(sessionStorage.getItem("refresh")).toBe("test-refresh-token");
  });

  it("should logout successfully", async () => {
    const authStore = useAuthStore();

    vi.mocked(api.post).mockResolvedValue({
      data: {
        access: "test-access-token",
        refresh: "test-refresh-token",
      },
    } as any);

    await authStore.login("testuser", "Password123!");
    authStore.logout();

    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.accessToken).toBeNull();
    expect(authStore.refreshToken).toBeNull();

    expect(sessionStorage.getItem("access")).toBeNull();
    expect(sessionStorage.getItem("refresh")).toBeNull();
  });

  it("should remain unauthenticated when login fails", async () => {
    const authStore = useAuthStore();

    vi.mocked(api.post).mockRejectedValue(new Error("Login failed"));

    await expect(
      authStore.login("testuser", "wrong-password")
    ).rejects.toThrow("Login failed");

    expect(authStore.isAuthenticated).toBe(false);
  });
});
