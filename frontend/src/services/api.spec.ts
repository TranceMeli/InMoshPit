import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { api, registerAuthHooks } from "./api";

function responseConfig(config: AxiosRequestConfig) {
  return api.get("/test/", {
    ...config,
    adapter: async (requestConfig) => ({
      data: requestConfig,
      status: 200,
      statusText: "OK",
      headers: {},
      config: requestConfig,
    }),
  });
}

describe("API client authentication", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("adds the stored access token to requests", async () => {
    sessionStorage.setItem("access", "test-access-token");

    const response = await responseConfig({});

    expect(response.data.headers.get("Authorization")).toBe(
      "Bearer test-access-token",
    );
  });

  it("does not add authorization when there is no stored token", async () => {
    const response = await responseConfig({});

    expect(response.data.headers.get("Authorization")).toBeUndefined();
  });
});

describe("automatic token refresh", () => {
  const originalAdapter = api.defaults.adapter;

  /** Antwortet 401, solange nicht das erwartete Token gesendet wird. */
  function useServer(validAccess: string, calls: string[] = []) {
    api.defaults.adapter = async (config) => {
      calls.push(`${config.url}:${config.headers.get("Authorization")}`);

      if (config.headers.get("Authorization") !== `Bearer ${validAccess}`) {
        throw new AxiosError(
          "Unauthorized",
          AxiosError.ERR_BAD_REQUEST,
          config,
          null,
          {
            status: 401,
            statusText: "Unauthorized",
            data: { detail: "expired" },
            headers: {},
            config,
          },
        );
      }

      return {
        data: { ok: true, url: config.url },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    return calls;
  }

  function refreshRejects(status: number) {
    return vi.spyOn(axios, "post").mockRejectedValue(
      new AxiosError("Rejected", AxiosError.ERR_BAD_REQUEST, undefined, null, {
        status,
        statusText: "",
        data: {},
        headers: {},
        config: {} as never,
      }),
    );
  }

  beforeEach(() => {
    sessionStorage.clear();
    registerAuthHooks({});
  });

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
    sessionStorage.clear();
    registerAuthHooks({});
  });

  it("refreshes an expired access token and retries the request", async () => {
    sessionStorage.setItem("access", "old");
    sessionStorage.setItem("refresh", "refresh-1");
    const calls = useServer("new");
    const post = vi
      .spyOn(axios, "post")
      .mockResolvedValue({ data: { access: "new" } });
    const onTokensRefreshed = vi.fn();
    registerAuthHooks({ onTokensRefreshed });

    const response = await api.get("/protected/");

    expect(response.data.ok).toBe(true);
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0]).toContain("/accounts/token/refresh/");
    expect(post.mock.calls[0][1]).toEqual({ refresh: "refresh-1" });
    expect(calls).toEqual(["/protected/:Bearer old", "/protected/:Bearer new"]);
    expect(sessionStorage.getItem("access")).toBe("new");
    expect(onTokensRefreshed).toHaveBeenCalledWith("new", "refresh-1");
  });

  it("stores a rotated refresh token", async () => {
    sessionStorage.setItem("access", "old");
    sessionStorage.setItem("refresh", "refresh-1");
    useServer("new");
    vi.spyOn(axios, "post").mockResolvedValue({
      data: { access: "new", refresh: "refresh-2" },
    });
    const onTokensRefreshed = vi.fn();
    registerAuthHooks({ onTokensRefreshed });

    await api.get("/protected/");

    expect(sessionStorage.getItem("refresh")).toBe("refresh-2");
    expect(onTokensRefreshed).toHaveBeenCalledWith("new", "refresh-2");
  });

  it("refreshes only once for concurrent requests", async () => {
    sessionStorage.setItem("access", "old");
    sessionStorage.setItem("refresh", "refresh-1");
    useServer("new");
    const post = vi.spyOn(axios, "post").mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { access: "new" } }), 20),
        ),
    );

    const results = await Promise.all([
      api.get("/a/"),
      api.get("/b/"),
      api.get("/c/"),
    ]);

    expect(results.map((r) => r.data.url)).toEqual(["/a/", "/b/", "/c/"]);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("ends the session when the refresh token is rejected", async () => {
    sessionStorage.setItem("access", "old");
    sessionStorage.setItem("refresh", "expired");
    useServer("new");
    refreshRejects(401);
    const onSessionExpired = vi.fn();
    registerAuthHooks({ onSessionExpired });

    await expect(api.get("/a/")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("access")).toBeNull();
    expect(sessionStorage.getItem("refresh")).toBeNull();
  });

  it("signals an expired session only once for concurrent requests", async () => {
    sessionStorage.setItem("access", "old");
    sessionStorage.setItem("refresh", "expired");
    useServer("new");
    refreshRejects(401);
    const onSessionExpired = vi.fn();
    registerAuthHooks({ onSessionExpired });

    const results = await Promise.allSettled([api.get("/a/"), api.get("/b/")]);

    expect(results.every((r) => r.status === "rejected")).toBe(true);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it("keeps the session when the refresh fails because of the network", async () => {
    sessionStorage.setItem("access", "old");
    sessionStorage.setItem("refresh", "refresh-1");
    useServer("new");
    vi.spyOn(axios, "post").mockRejectedValue(new Error("Network Error"));
    const onSessionExpired = vi.fn();
    registerAuthHooks({ onSessionExpired });

    await expect(api.get("/a/")).rejects.toBeDefined();

    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("refresh")).toBe("refresh-1");
  });

  it("does not try to refresh when there is no refresh token", async () => {
    sessionStorage.setItem("access", "old");
    useServer("new");
    const post = vi.spyOn(axios, "post");

    await expect(api.get("/a/")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(post).not.toHaveBeenCalled();
  });

  it("does not refresh for anonymous requests", async () => {
    sessionStorage.setItem("refresh", "refresh-1");
    useServer("new");
    const post = vi.spyOn(axios, "post");

    await expect(api.get("/a/")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(post).not.toHaveBeenCalled();
  });

  it("does not refresh after a failed login", async () => {
    sessionStorage.setItem("access", "stale");
    sessionStorage.setItem("refresh", "refresh-1");
    useServer("new");
    const post = vi.spyOn(axios, "post");

    await expect(
      api.post("/accounts/token/", { username: "a", password: "b" }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(post).not.toHaveBeenCalled();
  });

  it("retries a request at most once", async () => {
    sessionStorage.setItem("access", "old");
    sessionStorage.setItem("refresh", "refresh-1");
    // Der Server lehnt auch das neue Token ab.
    const calls = useServer("never-valid");
    const post = vi
      .spyOn(axios, "post")
      .mockResolvedValue({ data: { access: "new" } });

    await expect(api.get("/a/")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(post).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(2);
  });
});
