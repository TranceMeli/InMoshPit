import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import MediaCard from "./MediaCard.vue";

const stubs = { RouterLink: { props: ["to"], template: "<a :href='to'><slot /></a>" } };

const base = {
  to: "/videos/clip",
  title: "Lena Noise – Live at Winter Riot",
  cover: { kind: "video", seed: "clip" } as const,
};

describe("MediaCard", () => {
  it("links to the target and shows title and details", () => {
    const wrapper = mount(MediaCard, {
      props: { ...base, meta: ["Winter Riot 2025", "Werkstatt Club · Berlin"] },
      global: { stubs },
    });

    expect(wrapper.get("a").attributes("href")).toBe("/videos/clip");
    expect(wrapper.get("h3").text()).toBe("Lena Noise – Live at Winter Riot");
    expect(wrapper.findAll("p").map((p) => p.text())).toEqual([
      "Winter Riot 2025",
      "Werkstatt Club · Berlin",
    ]);
  });

  it("shows an icon tile when there is no image", () => {
    const wrapper = mount(MediaCard, { props: base, global: { stubs } });

    expect(wrapper.find(".cover").exists()).toBe(true);
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("prefers an uploaded image over the tile", () => {
    const wrapper = mount(MediaCard, {
      props: { ...base, image: "http://example.test/a.png" },
      global: { stubs },
    });

    expect(wrapper.get("img").attributes("src")).toBe("http://example.test/a.png");
    expect(wrapper.find(".cover").exists()).toBe(false);
  });

  it("renders a live badge with a pulsing dot", () => {
    const wrapper = mount(MediaCard, {
      props: { ...base, badge: { type: "live", text: "LIVE" } },
      global: { stubs },
    });

    const badge = wrapper.get("[data-testid='badge-live']");

    expect(badge.text()).toBe("LIVE");
    expect(badge.find(".dot").exists()).toBe(true);
  });

  it.each(["upcoming", "info", "duration"] as const)("renders a %s badge without the dot", (type) => {
    const wrapper = mount(MediaCard, {
      props: { ...base, badge: { type, text: "9:56" } },
      global: { stubs },
    });

    expect(wrapper.get(`[data-testid='badge-${type}']`).find(".dot").exists()).toBe(false);
  });

  it("renders no badge when none is given", () => {
    const wrapper = mount(MediaCard, { props: base, global: { stubs } });

    expect(wrapper.find(".badge").exists()).toBe(false);
  });
});
