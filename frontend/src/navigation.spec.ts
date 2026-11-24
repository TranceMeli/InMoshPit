import { describe, expect, it } from "vitest";

import { BOTTOM_NAV, LEGAL_LINKS, MAIN_NAV, isNavActive } from "./navigation";

describe("isNavActive", () => {
  it("matches the home page only exactly", () => {
    expect(isNavActive("/", "/")).toBe(true);
    expect(isNavActive("/", "/events")).toBe(false);
  });

  it("matches a section and its sub pages", () => {
    expect(isNavActive("/artists", "/artists")).toBe(true);
    expect(isNavActive("/artists", "/artists/lena-noise")).toBe(true);
  });

  it("does not match a different section with the same prefix", () => {
    expect(isNavActive("/events", "/events-archive")).toBe(false);
    expect(isNavActive("/videos", "/streams")).toBe(false);
  });
});

describe("navigation definition", () => {
  it("lists the main sections in order", () => {
    expect(MAIN_NAV.map((item) => item.to)).toEqual([
      "/",
      "/streams",
      "/events",
      "/videos",
      "/artists",
      "/bands",
    ]);
  });

  it("shows the live count only on the live entry", () => {
    expect(MAIN_NAV.filter((item) => item.badge).map((item) => item.to)).toEqual(["/streams"]);
  });

  it("reuses the four most important entries for the bottom navigation", () => {
    expect(BOTTOM_NAV.map((item) => item.to)).toEqual(["/", "/streams", "/events", "/videos"]);
  });

  it("links the legal pages", () => {
    expect(LEGAL_LINKS.map((link) => link.to)).toEqual([
      "/impressum",
      "/datenschutz",
      "/nutzungsbedingungen",
      "/kontakt",
    ]);
  });
});
