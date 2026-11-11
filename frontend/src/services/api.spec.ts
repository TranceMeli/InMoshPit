import { afterEach, describe, expect, it } from "vitest";
import type { AxiosRequestConfig } from "axios";
import { api } from "./api";

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
