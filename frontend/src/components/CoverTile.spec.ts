import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { ICONS } from "../icons";
import AppIcon from "./AppIcon.vue";
import CoverTile from "./CoverTile.vue";

describe("AppIcon", () => {
  it("is decorative by default", () => {
    const wrapper = mount(AppIcon, { props: { name: "home" } });
    const svg = wrapper.get("svg");

    expect(svg.attributes("aria-hidden")).toBe("true");
    expect(svg.attributes("role")).toBeUndefined();
    expect(svg.attributes("focusable")).toBe("false");
    expect(wrapper.get("path").attributes("d")).toBe(ICONS.home.outlined);
  });

  it("switches to the filled shape", () => {
    const wrapper = mount(AppIcon, { props: { name: "home", filled: true } });

    expect(wrapper.get("path").attributes("d")).toBe(ICONS.home.filled);
  });

  it("becomes an image with a label when one is given", () => {
    const wrapper = mount(AppIcon, { props: { name: "search", label: "Search" } });
    const svg = wrapper.get("svg");

    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-label")).toBe("Search");
    expect(svg.attributes("aria-hidden")).toBeUndefined();
  });

  it("accepts numbers (px) and CSS lengths as size", () => {
    expect(mount(AppIcon, { props: { name: "home", size: 24 } }).get("svg").attributes("style")).toContain("24px");
    expect(
      mount(AppIcon, { props: { name: "home", size: "min(46cqw, 64cqh)" } }).get("svg").attributes("style"),
    ).toContain("min(46cqw, 64cqh)");
  });
});

describe("CoverTile", () => {
  it("renders the icon and palette for a genre", () => {
    const wrapper = mount(CoverTile, { props: { kind: "artist", seed: "iron", genre: "Metal" } });

    expect(wrapper.classes()).toContain("cover--violet");
    expect(wrapper.get("path").attributes("d")).toBe(ICONS.bolt.filled);
  });

  it("is hidden from assistive technology", () => {
    const wrapper = mount(CoverTile, { props: { kind: "video", seed: "v" } });

    expect(wrapper.attributes("aria-hidden")).toBe("true");
  });

  it("shows the live icon for a live stream", () => {
    const wrapper = mount(CoverTile, { props: { kind: "stream", seed: "s", status: "live" } });

    expect(wrapper.classes()).toContain("cover--pink");
    expect(wrapper.get("path").attributes("d")).toBe(ICONS.sensors.filled);
  });
});
