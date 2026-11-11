
import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./api";
import {
  getArtists,
  getArtist,
  getBands,
  getBand,
  getGenres,
} from "./artists";

vi.mock("./api", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("Artist API service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches all artists", async () => {
    const artists = [
      {
        id: 1,
        name: "Test Artist",
        slug: "test-artist",
        bio: "Test bio",
        image: null,
        genres: [],
        website: "",
        created_at: "2026-11-10T12:00:00Z",
      },
    ];

    vi.mocked(api.get).mockResolvedValue({ data: artists });

    const result = await getArtists();

    expect(api.get).toHaveBeenCalledWith("/artists/", {
      params: {},
    });
    expect(result).toEqual(artists);
  });

  it("searches artists", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    await getArtists("Metal");

    expect(api.get).toHaveBeenCalledWith("/artists/", {
      params: { search: "Metal" },
    });
  });

  it("fetches an artist by slug", async () => {
    const artist = {
      id: 1,
      name: "Test Artist",
      slug: "test-artist",
    };

    vi.mocked(api.get).mockResolvedValue({ data: artist });

    const result = await getArtist("test-artist");

    expect(api.get).toHaveBeenCalledWith("/artists/test-artist/");
    expect(result).toEqual(artist);
  });

  it("fetches all bands", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    await getBands();

    expect(api.get).toHaveBeenCalledWith("/bands/", {
      params: {},
    });
  });

  it("searches bands", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    await getBands("Rock");

    expect(api.get).toHaveBeenCalledWith("/bands/", {
      params: { search: "Rock" },
    });
  });

  it("fetches a band by slug", async () => {
    const band = {
      id: 1,
      name: "Test Band",
      slug: "test-band",
    };

    vi.mocked(api.get).mockResolvedValue({ data: band });

    const result = await getBand("test-band");

    expect(api.get).toHaveBeenCalledWith("/bands/test-band/");
    expect(result).toEqual(band);
  });

  it("fetches all genres", async () => {
    const genres = [
      { id: 1, name: "Metal", slug: "metal" },
    ];

    vi.mocked(api.get).mockResolvedValue({ data: genres });

    const result = await getGenres();

    expect(api.get).toHaveBeenCalledWith("/genres/", {
      params: {},
    });
    expect(result).toEqual(genres);
  });
});
