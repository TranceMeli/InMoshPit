import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { setLocale } from "../i18n";
import { getStreams, type Stream } from "../services/streams";
import { getVideos, type Video } from "../services/video";
import HomeView from "./HomeView.vue";

vi.mock("../services/streams", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/streams")>()),
  getStreams: vi.fn(),
}));

vi.mock("../services/video", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/video")>()),
  getVideos: vi.fn(),
}));

const stubs = { RouterLink: { props: ["to"], template: "<a :href='to'><slot /></a>" } };

function stream(overrides: Partial<Stream>): Stream {
  return {
    id: 1,
    title: "Stream",
    slug: "stream",
    description: "",
    event: 1,
    event_title: "Event",
    event_slug: "event",
    venue_name: "Hafenhalle",
    venue_city: "Hamburg",
    status: "scheduled",
    scheduled_at: "2026-12-01T18:00:00Z",
    started_at: null,
    ended_at: null,
    playback_url: "",
    thumbnail: null,
    is_public: true,
    ...overrides,
  };
}

function video(overrides: Partial<Video>): Video {
  return {
    id: 1,
    title: "Video",
    slug: "video",
    description: "",
    event: 1,
    event_title: "Winter Riot 2025",
    event_slug: "winter-riot",
    venue_name: "Werkstatt Club",
    venue_city: "Berlin",
    duration_seconds: 596,
    thumbnail: null,
    ...overrides,
  };
}

const streams = [
  stream({ id: 1, slug: "later", title: "Later", scheduled_at: "2026-12-20T18:00:00Z" }),
  stream({ id: 2, slug: "live-now", title: "Live now", status: "live" }),
  stream({ id: 3, slug: "sooner", title: "Sooner", scheduled_at: "2026-12-02T18:00:00Z" }),
  stream({ id: 4, slug: "old", title: "Old stream", status: "ended" }),
  stream({ id: 5, slug: "cancelled", title: "Cancelled", status: "cancelled" }),
];

const videos = [video({ id: 10, slug: "clip", title: "Clip" })];

function mountHome() {
  return mount(HomeView, { global: { stubs } });
}

const titles = (wrapper: ReturnType<typeof mountHome>) => wrapper.findAll("h3").map((h) => h.text());

describe("HomeView", () => {
  beforeEach(() => {
    setLocale("de");
    vi.mocked(getStreams).mockResolvedValue(streams);
    vi.mocked(getVideos).mockResolvedValue(videos);
  });

  it("shows a loading state first", () => {
    const wrapper = mountHome();

    expect(wrapper.get("[role='status']").text()).toBe("Inhalte werden geladen ...");
  });

  it("lists live streams first, then upcoming by date, then recordings", async () => {
    const wrapper = mountHome();
    await flushPromises();

    expect(titles(wrapper)).toEqual(["Live now", "Sooner", "Later", "Clip"]);
  });

  it("leaves out ended and cancelled streams (their recordings are videos)", async () => {
    const wrapper = mountHome();
    await flushPromises();

    expect(titles(wrapper)).not.toContain("Old stream");
    expect(titles(wrapper)).not.toContain("Cancelled");
  });

  it("links the cards to the detail pages", async () => {
    const wrapper = mountHome();
    await flushPromises();

    expect(wrapper.findAll("a.media-card").map((a) => a.attributes("href"))).toEqual([
      "/streams/live-now",
      "/streams/sooner",
      "/streams/later",
      "/videos/clip",
    ]);
  });

  it("shows a LIVE badge, an upcoming date and the duration", async () => {
    const wrapper = mountHome();
    await flushPromises();

    expect(wrapper.get("[data-testid='badge-live']").text()).toBe("LIVE");
    expect(wrapper.findAll("[data-testid='badge-upcoming']")).toHaveLength(2);
    expect(wrapper.get("[data-testid='badge-upcoming']").text()).toMatch(/Dez/);
    expect(wrapper.get("[data-testid='badge-duration']").text()).toBe("9:56");
  });

  it("shows venue and event details", async () => {
    const wrapper = mountHome();
    await flushPromises();

    const first = wrapper.get("a.media-card");

    expect(first.text()).toContain("Event");
    expect(first.text()).toContain("Hafenhalle · Hamburg");
  });

  it("uses icon tiles because nothing has an image", async () => {
    const wrapper = mountHome();
    await flushPromises();

    expect(wrapper.findAll(".cover")).toHaveLength(4);
    expect(wrapper.find("img").exists()).toBe(false);
  });

  describe("filters", () => {
    async function pick(label: string) {
      const wrapper = mountHome();
      await flushPromises();
      await wrapper.findAll(".chip").find((c) => c.text() === label)!.trigger("click");

      return wrapper;
    }

    it("starts with all and marks the selection", async () => {
      const wrapper = mountHome();
      await flushPromises();

      const chips = wrapper.findAll(".chip");

      expect(chips.map((c) => c.text())).toEqual(["Alle", "Jetzt live", "Demnächst", "Aufzeichnungen"]);
      expect(chips[0].attributes("aria-pressed")).toBe("true");
      expect(chips[1].attributes("aria-pressed")).toBe("false");
    });

    it("shows only live streams", async () => {
      const wrapper = await pick("Jetzt live");

      expect(titles(wrapper)).toEqual(["Live now"]);
    });

    it("shows only upcoming streams", async () => {
      const wrapper = await pick("Demnächst");

      expect(titles(wrapper)).toEqual(["Sooner", "Later"]);
    });

    it("shows only recordings", async () => {
      const wrapper = await pick("Aufzeichnungen");

      expect(titles(wrapper)).toEqual(["Clip"]);
    });

    it("returns to everything", async () => {
      const wrapper = await pick("Aufzeichnungen");

      await wrapper.findAll(".chip")[0].trigger("click");

      expect(titles(wrapper)).toHaveLength(4);
    });

    it("explains an empty filter", async () => {
      vi.mocked(getStreams).mockResolvedValue([]);

      const wrapper = await pick("Jetzt live");

      expect(wrapper.text()).toContain("Hier gibt es noch nichts zu sehen.");
      expect(wrapper.find(".grid").exists()).toBe(false);
    });
  });

  describe("errors", () => {
    it("shows an error and retries on demand", async () => {
      vi.mocked(getStreams).mockRejectedValueOnce(new Error("offline"));

      const wrapper = mountHome();
      await flushPromises();

      expect(wrapper.get("[role='alert']").text()).toContain("Die Inhalte konnten nicht geladen werden.");

      await wrapper.get(".retry").trigger("click");
      await flushPromises();

      expect(wrapper.find("[role='alert']").exists()).toBe(false);
      expect(titles(wrapper)).toHaveLength(4);
    });
  });

  it("translates the badge and filters into English", async () => {
    setLocale("en");

    const wrapper = mountHome();
    await flushPromises();

    expect(wrapper.findAll(".chip").map((c) => c.text())).toEqual(["All", "Live now", "Upcoming", "Recordings"]);
    expect(wrapper.get("[data-testid='badge-upcoming']").text()).toMatch(/Dec/);
  });
});
