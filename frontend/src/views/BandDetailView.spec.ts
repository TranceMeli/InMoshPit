import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";
import { getBand, type Band } from "../services/artists";
import BandDetailView from "./BandDetailView.vue";

vi.mock("../services/artists", () => ({
  getBand: vi.fn(),
}));

async function mountAtBandSlug() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/bands/:slug", component: BandDetailView }],
  });
  await router.push("/bands/vale-collective");
  await router.isReady();

  const wrapper = mount(RouterView, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

describe("BandDetailView", () => {
  it("loads and displays the band profile and members", async () => {
    vi.mocked(getBand).mockResolvedValue({
      id: 1,
      name: "Vale Collective",
      slug: "vale-collective",
      bio: "Live indie band",
      image: null,
      genres: [{ id: 1, name: "Indie", slug: "indie" }],
      website: "",
      created_at: "2026-01-01",
      members: [
        {
          id: 1,
          artist: {
            id: 2,
            name: "Mira Vale",
            slug: "mira-vale",
            image: null,
          },
          role: "Vocals",
          joined_on: "2020-01-01",
          left_on: null,
        },
      ],
    } satisfies Band);

    const wrapper = await mountAtBandSlug();

    expect(getBand).toHaveBeenCalledWith("vale-collective");
    expect(wrapper.text()).toContain("Vale Collective");
    expect(wrapper.text()).toContain("Mira Vale");
    expect(wrapper.text()).toContain("Vocals");
  });

  it("shows a not-found state when the request fails", async () => {
    vi.mocked(getBand).mockRejectedValue(new Error("Not found"));

    const wrapper = await mountAtBandSlug();

    expect(wrapper.text()).toContain("Band nicht gefunden");
    expect(wrapper.text()).toContain("Zurück zur Band-Übersicht");
  });
});
