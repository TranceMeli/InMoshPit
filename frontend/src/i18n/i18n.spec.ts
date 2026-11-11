import { beforeEach, describe, expect, it } from "vitest";

import de from "./locales/de.json";
import en from "./locales/en.json";
import { getLocale, intlLocale, setLocale, t } from "./index";

function flatten(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? flatten(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

function leaves(obj: Record<string, unknown>, prefix = ""): [string, string][] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? leaves(value as Record<string, unknown>, `${prefix}${key}.`)
      : ([[`${prefix}${key}`, String(value)]] as [string, string][]),
  );
}

describe("translation catalogs", () => {
  it("contain exactly the same keys in German and English", () => {
    expect(flatten(en).sort()).toEqual(flatten(de).sort());
  });

  it("use the same placeholders in both languages", () => {
    const enMap = new Map(leaves(en));

    for (const [key, deText] of leaves(de)) {
      expect(placeholders(enMap.get(key) ?? ""), key).toEqual(
        placeholders(deText),
      );
    }
  });

  it("have no empty translations", () => {
    for (const [key, text] of [...leaves(de), ...leaves(en)]) {
      expect(text.trim(), key).not.toBe("");
    }
  });
});

describe("locale switching", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("translates reactively when the locale changes", () => {
    setLocale("de");
    expect(t("nav.register")).toBe("Registrieren");

    setLocale("en");
    expect(t("nav.register")).toBe("Sign up");
  });

  it("persists the choice and updates the document language", () => {
    setLocale("en");

    expect(localStorage.getItem("locale")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(getLocale()).toBe("en");
  });

  it("uses matching Intl locales", () => {
    setLocale("de");
    expect(intlLocale()).toBe("de-DE");

    setLocale("en");
    expect(intlLocale()).toBe("en-GB");
  });

  it("pluralizes counts", () => {
    setLocale("en");
    expect(t("events.count", 1)).toBe("1 event");
    expect(t("events.count", 3)).toBe("3 events");
    expect(t("events.count", 0)).toBe("0 events");

    setLocale("de");
    expect(t("events.count", 1)).toBe("1 Event");
    expect(t("events.count", 2)).toBe("2 Events");
  });
});
