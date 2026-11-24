import type { IconName } from "../icons";

/**
 * Bestimmt Icon und Farbwelt der Kachel, die anstelle eines Bildes angezeigt
 * wird. Alles hängt nur von den Daten ab (Art, Genre, Status, Seed), sodass
 * dieselbe Kachel bei jedem Aufruf gleich aussieht.
 */

export type CoverKind = "artist" | "band" | "event" | "stream" | "video";

export type CoverPalette = "violet" | "pink" | "amber" | "dark" | "electric";

export interface CoverInput {
  kind: CoverKind;
  /** Stabiler Wert (z. B. der Slug); bestimmt die Farbe, wenn nichts anderes passt. */
  seed: string;
  genre?: string | null;
  eventType?: "concert" | "festival" | null;
  status?: "scheduled" | "live" | "ended" | "cancelled" | null;
}

export interface Cover {
  icon: IconName;
  palette: CoverPalette;
}

const PALETTES: CoverPalette[] = ["violet", "pink", "amber", "dark", "electric"];

/** Genre (klein geschrieben) -> Icon und Farbwelt. */
const GENRES: Record<string, Cover> = {
  metal: { icon: "bolt", palette: "violet" },
  punk: { icon: "local_fire_department", palette: "amber" },
  electro: { icon: "graphic_eq", palette: "pink" },
  synthwave: { icon: "wb_twilight", palette: "dark" },
  rock: { icon: "album", palette: "electric" },
  folk: { icon: "forest", palette: "pink" },
};

/** Einfacher, stabiler Hash (djb2) für die Farbwahl. */
export function hashSeed(seed: string): number {
  let hash = 5381;

  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function paletteFor(seed: string): CoverPalette {
  return PALETTES[hashSeed(seed) % PALETTES.length];
}

/** Konzerte wechseln die Farbe; Pink bleibt den Festivals und dem Live-Status. */
const CONCERT_PALETTES: CoverPalette[] = ["violet", "dark", "electric", "amber"];

/** Pink ist dem Live-Status vorbehalten, damit "live" sofort auffällt. */
const SCHEDULED_PALETTES: CoverPalette[] = ["violet", "dark", "electric", "amber"];

function streamCover(status: CoverInput["status"], seed: string): Cover {
  switch (status) {
    case "live":
      return { icon: "sensors", palette: "pink" };
    case "scheduled":
      return {
        icon: "schedule",
        palette: SCHEDULED_PALETTES[hashSeed(seed) % SCHEDULED_PALETTES.length],
      };
    default:
      return { icon: "play_circle", palette: "dark" };
  }
}

export function coverFor(input: CoverInput): Cover {
  const genre = GENRES[(input.genre ?? "").trim().toLowerCase()];

  switch (input.kind) {
    case "artist":
      return genre ?? { icon: "mic_external_on", palette: paletteFor(input.seed) };

    case "band":
      return genre ?? { icon: "groups", palette: paletteFor(input.seed) };

    case "event":
      return input.eventType === "festival"
        ? { icon: "festival", palette: "pink" }
        : { icon: "stadium", palette: CONCERT_PALETTES[hashSeed(input.seed) % CONCERT_PALETTES.length] };

    case "stream":
      return streamCover(input.status, input.seed);

    case "video":
      return { icon: "play_circle", palette: paletteFor(input.seed) };
  }
}
