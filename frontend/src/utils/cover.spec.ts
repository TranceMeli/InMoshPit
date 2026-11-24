import { describe, expect, it } from "vitest";

import { coverFor, hashSeed } from "./cover";

describe("coverFor", () => {
  it.each([
    ["Metal", "bolt", "violet"],
    ["punk", "local_fire_department", "amber"],
    [" Electro ", "graphic_eq", "pink"],
    ["Synthwave", "wb_twilight", "dark"],
    ["Rock", "album", "electric"],
    ["Folk", "forest", "pink"],
  ])("maps the genre %s to icon %s and palette %s", (genre, icon, palette) => {
    expect(coverFor({ kind: "artist", seed: "x", genre })).toEqual({ icon, palette });
    expect(coverFor({ kind: "band", seed: "x", genre })).toEqual({ icon, palette });
  });

  it("falls back to a kind specific icon for unknown or missing genres", () => {
    expect(coverFor({ kind: "artist", seed: "x", genre: "Polka" }).icon).toBe("mic_external_on");
    expect(coverFor({ kind: "artist", seed: "x" }).icon).toBe("mic_external_on");
    expect(coverFor({ kind: "band", seed: "x", genre: null }).icon).toBe("groups");
  });

  it("distinguishes festivals from concerts", () => {
    expect(coverFor({ kind: "event", seed: "a", eventType: "festival" })).toEqual({
      icon: "festival",
      palette: "pink",
    });
    expect(coverFor({ kind: "event", seed: "a", eventType: "concert" }).icon).toBe("stadium");
    expect(coverFor({ kind: "event", seed: "a" }).icon).toBe("stadium");
  });

  it("varies the color of concerts but keeps pink for festivals", () => {
    const palettes = new Set(
      Array.from(
        { length: 40 },
        (_, i) => coverFor({ kind: "event", seed: `event-${i}`, eventType: "concert" }).palette,
      ),
    );

    expect(palettes.size).toBeGreaterThan(2);
    expect(palettes.has("pink")).toBe(false);
    expect(
      new Set(
        Array.from({ length: 10 }, (_, i) => coverFor({ kind: "event", seed: `f-${i}`, eventType: "festival" }).palette),
      ),
    ).toEqual(new Set(["pink"]));
  });

  it("reflects the stream status", () => {
    expect(coverFor({ kind: "stream", seed: "s", status: "live" })).toEqual({
      icon: "sensors",
      palette: "pink",
    });
    expect(coverFor({ kind: "stream", seed: "s", status: "scheduled" }).icon).toBe("schedule");
    expect(coverFor({ kind: "stream", seed: "s", status: "ended" }).icon).toBe("play_circle");
    expect(coverFor({ kind: "stream", seed: "s", status: "cancelled" }).icon).toBe("play_circle");
  });

  it("varies the palette of scheduled streams but keeps pink for live", () => {
    const palettes = new Set(
      Array.from(
        { length: 40 },
        (_, i) => coverFor({ kind: "stream", seed: `stream-${i}`, status: "scheduled" }).palette,
      ),
    );

    expect(palettes.size).toBeGreaterThan(2);
    expect(palettes.has("pink")).toBe(false);
    expect(coverFor({ kind: "stream", seed: "a", status: "scheduled" })).toEqual(
      coverFor({ kind: "stream", seed: "a", status: "scheduled" }),
    );
  });

  it("uses the play icon for videos", () => {
    expect(coverFor({ kind: "video", seed: "v" }).icon).toBe("play_circle");
  });

  it("is stable for the same seed and varies the palette across seeds", () => {
    const first = coverFor({ kind: "video", seed: "winter-riot" });

    expect(coverFor({ kind: "video", seed: "winter-riot" })).toEqual(first);

    const palettes = new Set(
      Array.from({ length: 30 }, (_, i) => coverFor({ kind: "video", seed: `video-${i}` }).palette),
    );

    expect(palettes.size).toBeGreaterThan(2);
  });
});

describe("hashSeed", () => {
  it("is deterministic and non-negative", () => {
    expect(hashSeed("iron-pit")).toBe(hashSeed("iron-pit"));
    expect(hashSeed("iron-pit")).not.toBe(hashSeed("lena-noise"));
    expect(hashSeed("")).toBeGreaterThanOrEqual(0);
  });
});
