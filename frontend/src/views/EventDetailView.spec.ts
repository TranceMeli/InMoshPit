import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";
import { getEvent, type Event } from "../services/events";
import EventDetailView from "./EventDetailView.vue";

vi.mock("../services/events", () => ({
  getEvent: vi.fn(),
}));

function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    title: "Summer Rock Night",
    slug: "summer-rock-night",
    description: "An outdoor rock concert.",
    event_type: "concert",
    venue: {
      id: 1,
      name: "MoshPit Arena",
      address: "Music Street 1",
      city: "Karlsruhe",
      postal_code: "76199",
      country: "Deutschland",
      capacity: 12000,
      website: "https://example.com/venue",
    },
    start_at: "2027-07-10T18:00:00Z",
    end_at: "2027-07-10T23:00:00Z",
    image: null,
    status: "published",
    stages: [{ id: 1, name: "Main Stage", description: "Outdoor stage." }],
    lineup: [
      {
        id: 1,
        artist: 1,
        artist_name: "Mira Vale",
        artist_slug: "mira-vale",
        band: null,
        band_name: null,
        band_slug: null,
        stage: 1,
        stage_name: "Main Stage",
        performance_start: "2027-07-10T19:00:00Z",
        performance_end: null,
        position: 0,
      },
      {
        id: 2,
        artist: null,
        artist_name: null,
        artist_slug: null,
        band: 2,
        band_name: "The Vale Collective",
        band_slug: "vale-collective",
        stage: 1,
        stage_name: "Main Stage",
        performance_start: null,
        performance_end: null,
        position: 1,
      },
    ],
    created_at: "2027-01-01T12:00:00Z",
    updated_at: "2027-01-01T12:00:00Z",
    ...overrides,
  };
}

async function mountAtEventSlug() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/events/:slug", component: EventDetailView }],
  });
  await router.push("/events/summer-rock-night");
  await router.isReady();

  const wrapper = mount(RouterView, {
    global: {
      plugins: [router],
      stubs: {
        RouterLink: {
          props: ["to"],
          template: "<a :href='to'><slot /></a>",
        },
      },
    },
  });
  await flushPromises();
  return wrapper;
}

describe("EventDetailView", () => {
  it("loads event details and renders venue, lineup, and stages", async () => {
    vi.mocked(getEvent).mockResolvedValue(createEvent());

    const wrapper = await mountAtEventSlug();

    expect(getEvent).toHaveBeenCalledWith("summer-rock-night");
    expect(wrapper.text()).toContain("Summer Rock Night");
    expect(wrapper.text()).toContain("MoshPit Arena");
    expect(wrapper.text()).toContain("Mira Vale");
    expect(wrapper.text()).toContain("The Vale Collective");
    expect(wrapper.text()).toContain("Main Stage");
    expect(wrapper.find('a[href="/artists/mira-vale"]').exists()).toBe(true);
    expect(wrapper.find('a[href="/bands/vale-collective"]').exists()).toBe(
      true,
    );
  });

  it("shows empty descriptions and line-up messages when absent", async () => {
    vi.mocked(getEvent).mockResolvedValue(
      createEvent({ description: "", lineup: [], stages: [] }),
    );

    const wrapper = await mountAtEventSlug();

    expect(wrapper.text()).toContain(
      "Für diese Veranstaltung wurde noch keine Beschreibung hinterlegt.",
    );
    expect(wrapper.text()).toContain(
      "Das Line-up wurde noch nicht veröffentlicht.",
    );
  });

  it("shows an error and retries loading after failure", async () => {
    vi.mocked(getEvent)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(createEvent());

    const wrapper = await mountAtEventSlug();

    expect(wrapper.text()).toContain(
      "Die Veranstaltung konnte nicht geladen werden.",
    );

    await wrapper.get(".back-button").trigger("click");
    await flushPromises();

    expect(getEvent).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain("Summer Rock Night");
  });
});
