import { describe, expect, it } from "vitest";

import groups from "../scripts/icons.json";
import { ICONS, ICON_NAMES } from "./icons";

/** SVG-Pfaddaten: beginnen mit einem Move-Befehl und enthalten nur Pfadzeichen. */
const PATH_DATA = /^[Mm][\d.\-\s,a-zA-Z]+$/;

describe("icons", () => {
  it("provides path data for every icon in both variants", () => {
    for (const name of ICON_NAMES) {
      expect(ICONS[name].outlined, `${name} outlined`).toMatch(PATH_DATA);
      expect(ICONS[name].filled, `${name} filled`).toMatch(PATH_DATA);
    }
  });

  it("uses a filled shape that differs from the outlined one for navigation icons", () => {
    for (const name of ["home", "sensors", "calendar_month", "smart_display"] as const) {
      expect(ICONS[name].filled).not.toBe(ICONS[name].outlined);
    }
  });

  it("is generated from scripts/icons.json (run `npm run icons` after editing it)", () => {
    const expected = [...new Set(Object.values(groups).flat())];

    expect([...ICON_NAMES]).toEqual(expected);
  });
});
