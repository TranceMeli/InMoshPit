import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { getBands, type Band } from "../services/artists";
import BandsView from "./BandsView.vue";

vi.mock("../services/artists", () => ({
  getBands: vi.fn(),
}));

describe("BandsView", () => {
  it("renders fallback content for incomplete band data", async () => {
    vi.mocked(getBands).mockResolvedValue([
      {
        id: 1,
        slug: "",
        bio: "",
        image: null,
        website: "",
        created_at: "",
      } as unknown as Band,
      {
        id: 2,
        name: "Incomplete Band",
        slug: "incomplete-band",
        bio: "",
        image: null,
        website: "",
        created_at: "",
        genres: [],
        members: [
          {
            id: 1,
            artist: null,
            role: "",
            joined_on: null,
            left_on: null,
          },
        ],
      } as unknown as Band,
    ]);

    const wrapper = mount(BandsView, {
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

    expect(wrapper.text()).toContain("Unbekannte Band");
    expect(wrapper.text()).toContain("Unbekanntes Mitglied");
  });
});
