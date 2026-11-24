import { describe, expect, it } from "vitest";

import { setLocale } from "../i18n";
import { formatShortDateTime, joinVenue } from "./format";

describe("formatShortDateTime", () => {
  it("formats German dates without a time zone name", () => {
    setLocale("de");

    const text = formatShortDateTime("2026-11-25T18:00:00Z");

    expect(text).toMatch(/Nov/);
    expect(text).toMatch(/\d{2}:\d{2}/);
    expect(text).not.toMatch(/UTC|GMT|MEZ/);
  });

  it("adds the time zone in English", () => {
    setLocale("en");

    expect(formatShortDateTime("2026-11-25T18:00:00Z")).toMatch(/\d{2}:\d{2} (UTC|GMT|CET|CEST|GMT[+-]\d+)$/);
  });
});

describe("joinVenue", () => {
  it("joins venue and city", () => {
    expect(joinVenue("Hafenhalle", "Hamburg")).toBe("Hafenhalle · Hamburg");
  });

  it("translates known city names in English only", () => {
    setLocale("en");
    expect(joinVenue("Grand Arena", "Wien")).toBe("Grand Arena · Vienna");
    expect(joinVenue("Rheinbühne", "Köln")).toBe("Rheinbühne · Cologne");

    setLocale("de");
    expect(joinVenue("Grand Arena", "Wien")).toBe("Grand Arena · Wien");
  });

  it("omits an empty city", () => {
    expect(joinVenue("Hafenhalle", "")).toBe("Hafenhalle");
    expect(joinVenue("Hafenhalle", null)).toBe("Hafenhalle");
    expect(joinVenue("Hafenhalle")).toBe("Hafenhalle");
  });
});
