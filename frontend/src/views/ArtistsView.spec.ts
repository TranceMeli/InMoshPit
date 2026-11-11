import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { getArtists, type Artist } from "../services/artists";
import ArtistsView from "./ArtistsView.vue";

vi.mock("../services/artists", () => ({
  getArtists: vi.fn(),
}));

describe("ArtistsView", () => {
  it("renders a fallback when an artist has no name", async () => {
    vi.mocked(getArtists).mockResolvedValue([
      {
        id: 1,
        slug: "unknown-artist",
        bio: "",
        image: null,
        genres: [],
        website: "",
        created_at: "",
      } as unknown as Artist,
    ]);

    const wrapper = mount(ArtistsView, {
      global: {
        stubs: {
          RouterLink: {
            props: ["to"],
            template: "<a><slot /></a>",
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Unbekannter Artist");
    expect(wrapper.text()).toContain("?");
  });
});
