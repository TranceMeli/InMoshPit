import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { setLocale } from "../i18n";
import { getArtists, getBands, type Artist, type Band } from "../services/artists";
import { getEvents, type Event } from "../services/events";
import { getStreams, type Stream } from "../services/streams";
import { getVideos, type Video } from "../services/video";
import { createTestRouter } from "../test/helpers";
import SearchView from "./SearchView.vue";

vi.mock("../services/streams", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/streams")>()),
  getStreams: vi.fn(),
}));
vi.mock("../services/video", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/video")>()),
  getVideos: vi.fn(),
}));
vi.mock("../services/events", () => ({ getEvents: vi.fn() }));
vi.mock("../services/artists", () => ({ getArtists: vi.fn(), getBands: vi.fn() }));

const stubs = { RouterLink: { props: ["to"], template: "<a :href='to'><slot /></a>" } };

const iron = {
  stream: {
    id: 1, slug: "iron-live", title: "Iron Pit live", event_title: "MoshPit Live Night",
    venue_name: "Hafenhalle", venue_city: "Hamburg", status: "live",
    scheduled_at: "2026-12-01T18:00:00Z", thumbnail: null,
  } as unknown as Stream,
  video: {
    id: 2, slug: "iron-clip", title: "Iron Pit at Winter Riot", event_title: "Winter Riot",
    venue_name: "Werkstatt Club", venue_city: "Berlin", duration_seconds: 596, thumbnail: null,
  } as unknown as Video,
  event: {
    id: 3, slug: "iron-night", title: "Iron Night", event_type: "festival", image: null,
    start_at: "2026-12-05T18:00:00Z", venue: { name: "Isar Loft", city: "München" },
  } as unknown as Event,
  artist: {
    id: 4, slug: "karl-brandt", name: "Karl Brandt", image: null, genres: [{ id: 1, name: "Metal", slug: "metal" }],
  } as unknown as Artist,
  band: {
    id: 5, slug: "iron-pit", name: "Iron Pit", image: null, genres: [{ id: 1, name: "Metal", slug: "metal" }],
  } as unknown as Band,
};

async function mountSearch(query: string | null) {
  const router = createTestRouter();
  await router.push(query === null ? "/search" : { path: "/search", query: { q: query } });
  await router.isReady();

  const wrapper = mount(SearchView, { global: { plugins: [router], stubs } });
  await flushPromises();

  return { wrapper, router };
}

function resolveAll() {
  vi.mocked(getStreams).mockResolvedValue([iron.stream]);
  vi.mocked(getVideos).mockResolvedValue([iron.video]);
  vi.mocked(getEvents).mockResolvedValue([iron.event]);
  vi.mocked(getArtists).mockResolvedValue([iron.artist]);
  vi.mocked(getBands).mockResolvedValue([iron.band]);
}

describe("SearchView", () => {
  beforeEach(() => {
    setLocale("de");
    vi.clearAllMocks();
    resolveAll();
  });

  it("asks for a search term and does not search without one", async () => {
    const { wrapper } = await mountSearch(null);

    expect(wrapper.text()).toContain("Gib einen Suchbegriff ein.");
    expect(getStreams).not.toHaveBeenCalled();
    expect(getArtists).not.toHaveBeenCalled();
  });

  it("treats a blank term like no term", async () => {
    const { wrapper } = await mountSearch("   ");

    expect(wrapper.text()).toContain("Gib einen Suchbegriff ein.");
    expect(getVideos).not.toHaveBeenCalled();
  });

  it("searches every content type with the term", async () => {
    await mountSearch("iron");

    expect(getStreams).toHaveBeenCalledWith({ search: "iron" });
    expect(getVideos).toHaveBeenCalledWith({ search: "iron" });
    expect(getEvents).toHaveBeenCalledWith({ search: "iron" });
    expect(getArtists).toHaveBeenCalledWith("iron");
    expect(getBands).toHaveBeenCalledWith("iron");
  });

  it("shows a heading with the term and one section per content type", async () => {
    const { wrapper } = await mountSearch("iron");

    expect(wrapper.get("h1").text()).toBe("Ergebnisse für „iron“");
    expect(wrapper.findAll(".section h2").map((h) => h.text())).toEqual([
      "Streams",
      "Videos",
      "Veranstaltungen",
      "Artists",
      "Bands",
    ]);
  });

  it("links every result to its page", async () => {
    const { wrapper } = await mountSearch("iron");

    expect(wrapper.findAll("a.media-card").map((a) => a.attributes("href"))).toEqual([
      "/streams/iron-live",
      "/videos/iron-clip",
      "/events/iron-night",
      "/artists/karl-brandt",
      "/bands/iron-pit",
    ]);
  });

  it("labels results with badges", async () => {
    const { wrapper } = await mountSearch("iron");

    expect(wrapper.get("[data-testid='badge-live']").text()).toBe("LIVE");
    expect(wrapper.get("[data-testid='badge-duration']").text()).toBe("9:56");
    expect(wrapper.get("[data-testid='badge-info']").text()).toBe("Festival");
  });

  it("shows genres for acts and the tile follows the genre", async () => {
    const { wrapper } = await mountSearch("iron");

    const artist = wrapper.get("a[href='/artists/karl-brandt']");

    expect(artist.text()).toContain("Metal");
    expect(artist.get(".cover").classes()).toContain("cover--violet");
  });

  it("omits sections without results", async () => {
    vi.mocked(getStreams).mockResolvedValue([]);
    vi.mocked(getEvents).mockResolvedValue([]);
    vi.mocked(getBands).mockResolvedValue([]);

    const { wrapper } = await mountSearch("iron");

    expect(wrapper.findAll(".section h2").map((h) => h.text())).toEqual(["Videos", "Artists"]);
  });

  it("explains when nothing was found", async () => {
    vi.mocked(getStreams).mockResolvedValue([]);
    vi.mocked(getVideos).mockResolvedValue([]);
    vi.mocked(getEvents).mockResolvedValue([]);
    vi.mocked(getArtists).mockResolvedValue([]);
    vi.mocked(getBands).mockResolvedValue([]);

    const { wrapper } = await mountSearch("xyz");

    expect(wrapper.get(".empty").text()).toContain("Keine Ergebnisse für „xyz“");
    expect(wrapper.find(".section").exists()).toBe(false);
  });

  it("shows an error when a request fails", async () => {
    vi.mocked(getVideos).mockRejectedValue(new Error("offline"));

    const { wrapper } = await mountSearch("iron");

    expect(wrapper.get("[role='alert']").text()).toContain("Die Suche ist fehlgeschlagen");
    expect(wrapper.find(".section").exists()).toBe(false);
  });

  it("searches again when the term in the address changes", async () => {
    const { wrapper, router } = await mountSearch("iron");

    vi.mocked(getArtists).mockResolvedValue([]);
    vi.mocked(getBands).mockResolvedValue([]);
    vi.mocked(getEvents).mockResolvedValue([]);
    vi.mocked(getStreams).mockResolvedValue([]);
    vi.mocked(getVideos).mockResolvedValue([]);

    await router.push({ path: "/search", query: { q: "lena" } });
    await flushPromises();

    expect(getArtists).toHaveBeenLastCalledWith("lena");
    expect(wrapper.get("h1").text()).toBe("Ergebnisse für „lena“");
  });

  it("ignores a slow answer for an older search", async () => {
    let releaseOld!: (value: Video[]) => void;
    const slowOld = new Promise<Video[]>((resolve) => (releaseOld = resolve));

    vi.mocked(getVideos).mockReturnValueOnce(slowOld);

    const { wrapper, router } = await mountSearch("old");

    // Zweite Suche liefert sofort ein anderes Ergebnis.
    vi.mocked(getVideos).mockResolvedValue([
      { ...iron.video, id: 99, slug: "new-clip", title: "New clip" } as Video,
    ]);
    await router.push({ path: "/search", query: { q: "new" } });
    await flushPromises();

    // Jetzt kommt die veraltete Antwort zu spät an.
    releaseOld([{ ...iron.video, id: 1, slug: "old-clip", title: "Old clip" } as Video]);
    await flushPromises();

    const links = wrapper.findAll("a.media-card").map((a) => a.attributes("href"));

    expect(links).toContain("/videos/new-clip");
    expect(links).not.toContain("/videos/old-clip");
  });

  it("translates the headings", async () => {
    setLocale("en");

    const { wrapper } = await mountSearch("iron");

    expect(wrapper.get("h1").text()).toBe("Results for “iron”");
    expect(wrapper.findAll(".section h2")[2].text()).toBe("Events");
  });
});
