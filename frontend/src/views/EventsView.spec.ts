import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { getEvents, type Event } from "../services/events";
import EventsView from "./EventsView.vue";

vi.mock("../services/events", () => ({
  getEvents: vi.fn(),
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
      website: "",
    },
    start_at: "2027-07-10T18:00:00Z",
    end_at: null,
    image: null,
    status: "published",
    lineup_count: 0,
    stages: [],
    lineup: [],
    created_at: "2027-01-01T12:00:00Z",
    updated_at: "2027-01-01T12:00:00Z",
    ...overrides,
  };
}

function mountView() {
  return mount(EventsView, {
    global: {
      stubs: {
        RouterLink: {
          props: ["to"],
          template: "<a :href='to'><slot /></a>",
        },
      },
    },
  });
}

describe("EventsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("loads and displays events", async () => {
    vi.mocked(getEvents).mockResolvedValue([
      createEvent({
        lineup_count: 1,
        lineup: [
          {
            id: 1,
            artist: 1,
            artist_name: "Mira Vale",
            artist_slug: "mira-vale",
            band: null,
            band_name: null,
            band_slug: null,
            stage: null,
            stage_name: null,
            performance_start: null,
            performance_end: null,
            position: 0,
          },
        ],
      }),
    ]);

    const wrapper = mountView();
    await flushPromises();

    expect(getEvents).toHaveBeenCalledWith({
      search: undefined,
      event_type: undefined,
      ordering: "start_at",
    });
    expect(wrapper.text()).toContain("Summer Rock Night");
    expect(wrapper.text()).toContain("MoshPit Arena, Karlsruhe");
    expect(wrapper.text()).toContain("1 Act");
    expect(wrapper.find('a[href="/events/summer-rock-night"]').exists()).toBe(
      true,
    );
  });

  it("debounces event searches and trims the query", async () => {
    vi.useFakeTimers();
    vi.mocked(getEvents).mockResolvedValue([]);

    const wrapper = mountView();
    await flushPromises();
    vi.mocked(getEvents).mockClear();

    await wrapper
      .get('input[aria-label="Veranstaltungen suchen"]')
      .setValue("  Summer  ");
    expect(getEvents).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(350);
    await flushPromises();

    expect(getEvents).toHaveBeenCalledWith({
      search: "Summer",
      event_type: undefined,
      ordering: "start_at",
    });
  });

  it("reloads events when the event type filter changes", async () => {
    vi.mocked(getEvents).mockResolvedValue([]);
    const wrapper = mountView();
    await flushPromises();

    await wrapper
      .get('select[aria-label="Veranstaltungstyp auswählen"]')
      .setValue("festival");
    await flushPromises();

    expect(getEvents).toHaveBeenLastCalledWith({
      search: undefined,
      event_type: "festival",
      ordering: "start_at",
    });
  });

  it("shows an empty state when there are no events", async () => {
    vi.mocked(getEvents).mockResolvedValue([]);
    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).toContain("Keine Veranstaltungen gefunden");
  });

  it("shows an error and retries loading after failure", async () => {
    vi.mocked(getEvents)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce([createEvent()]);
    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).toContain(
      "Die Veranstaltungen konnten nicht geladen werden.",
    );

    await wrapper.get(".retry-button").trigger("click");
    await flushPromises();

    expect(getEvents).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain("Summer Rock Night");
  });
});
