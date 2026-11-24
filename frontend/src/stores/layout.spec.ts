import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { getStreams } from "../services/streams";
import { useLayoutStore } from "./layout";

vi.mock("../services/streams", () => ({
  getStreams: vi.fn(),
}));

describe("layout store", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("starts expanded with a closed drawer", () => {
    const layout = useLayoutStore();

    expect(layout.preference).toBe("expanded");
    expect(layout.drawerOpen).toBe(false);
    expect(layout.liveCount).toBe(0);
  });

  it("restores a stored preference", () => {
    localStorage.setItem("sidebar", "rail");
    setActivePinia(createPinia());

    expect(useLayoutStore().preference).toBe("rail");
  });

  it("ignores an invalid stored value", () => {
    localStorage.setItem("sidebar", "nonsense");
    setActivePinia(createPinia());

    expect(useLayoutStore().preference).toBe("expanded");
  });

  it("collapses and expands on wide pages and remembers the choice", () => {
    const layout = useLayoutStore();

    layout.toggleMenu({ wide: true, compact: false });
    expect(layout.preference).toBe("rail");
    expect(localStorage.getItem("sidebar")).toBe("rail");
    expect(layout.drawerOpen).toBe(false);

    layout.toggleMenu({ wide: true, compact: false });
    expect(layout.preference).toBe("expanded");
    expect(localStorage.getItem("sidebar")).toBe("expanded");
  });

  it("opens the drawer on narrow pages instead of changing the preference", () => {
    const layout = useLayoutStore();

    layout.toggleMenu({ wide: false, compact: false });

    expect(layout.drawerOpen).toBe(true);
    expect(layout.preference).toBe("expanded");

    layout.toggleMenu({ wide: false, compact: false });
    expect(layout.drawerOpen).toBe(false);
  });

  it("opens the drawer on watch pages even when the screen is wide", () => {
    const layout = useLayoutStore();

    layout.toggleMenu({ wide: true, compact: true });

    expect(layout.drawerOpen).toBe(true);
    expect(layout.preference).toBe("expanded");
  });

  it("closes the drawer", () => {
    const layout = useLayoutStore();
    layout.toggleMenu({ wide: false, compact: false });

    layout.closeDrawer();

    expect(layout.drawerOpen).toBe(false);
  });

  it("counts live streams", async () => {
    vi.mocked(getStreams).mockResolvedValue([{ id: 1 }, { id: 2 }] as never);
    const layout = useLayoutStore();

    await layout.refreshLive();

    expect(getStreams).toHaveBeenCalledWith({ status: "live" });
    expect(layout.liveCount).toBe(2);
  });

  it("keeps the previous count when the request fails", async () => {
    vi.mocked(getStreams).mockResolvedValueOnce([{ id: 1 }] as never);
    const layout = useLayoutStore();
    await layout.refreshLive();

    vi.mocked(getStreams).mockRejectedValueOnce(new Error("offline"));
    await layout.refreshLive();

    expect(layout.liveCount).toBe(1);
  });
});
