import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";
import { getEvent, getEvents } from "./events";

vi.mock("./api", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("Event API service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches events without filters", async () => {
    const events = [{ id: 1, slug: "summer-show" }];
    vi.mocked(api.get).mockResolvedValue({ data: events });

    await expect(getEvents()).resolves.toEqual(events);
    expect(api.get).toHaveBeenCalledWith("/events/", { params: undefined });
  });

  it("passes event search, type, and ordering filters", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    const params = {
      search: "Summer",
      event_type: "festival" as const,
      ordering: "start_at",
    };

    await getEvents(params);

    expect(api.get).toHaveBeenCalledWith("/events/", { params });
  });

  it("fetches an event by slug", async () => {
    const event = { id: 1, slug: "summer-show" };
    vi.mocked(api.get).mockResolvedValue({ data: event });

    await expect(getEvent("summer-show")).resolves.toEqual(event);
    expect(api.get).toHaveBeenCalledWith("/events/summer-show/");
  });
});
