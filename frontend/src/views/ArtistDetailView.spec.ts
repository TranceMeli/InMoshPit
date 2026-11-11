import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";
import { getArtist, type Artist } from "../services/artists";
import ArtistDetailView from "./ArtistDetailView.vue";

vi.mock("../services/artists", () => ({
  getArtist: vi.fn(),
}));

async function mountAtArtistSlug() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/artists/:slug", component: ArtistDetailView }],
  });
  await router.push("/artists/mira-vale");
  await router.isReady();

  const wrapper = mount(RouterView, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

describe("ArtistDetailView", () => {
  it("loads and displays the artist profile", async () => {
    vi.mocked(getArtist).mockResolvedValue({
      id: 1,
      name: "Mira Vale",
      slug: "mira-vale",
      bio: "Singer-songwriter",
      image: null,
      genres: [{ id: 1, name: "Indie", slug: "indie" }],
      website: "https://example.com",
      created_at: "2026-01-01",
    } satisfies Artist);

    const wrapper = await mountAtArtistSlug();

    expect(getArtist).toHaveBeenCalledWith("mira-vale");
    expect(wrapper.text()).toContain("Mira Vale");
    expect(wrapper.text()).toContain("Singer-songwriter");
    expect(wrapper.text()).toContain("Indie");
  });

  it("shows a not-found state when the request fails", async () => {
    vi.mocked(getArtist).mockRejectedValue(new Error("Not found"));

    const wrapper = await mountAtArtistSlug();

    expect(wrapper.text()).toContain("Artist nicht gefunden");
    expect(wrapper.text()).toContain("Zurück zur Artist-Übersicht");
  });
});
