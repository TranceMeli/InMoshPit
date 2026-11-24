import type { IconName } from "./icons";

export interface NavItem {
  to: string;
  icon: IconName;
  /** Schlüssel im Übersetzungskatalog. */
  labelKey: string;
  /** Zeigt am Eintrag die Anzahl laufender Live-Streams. */
  badge?: "live";
}

/** Hauptnavigation der Seitenleiste. */
export const MAIN_NAV: NavItem[] = [
  { to: "/", icon: "home", labelKey: "nav.home" },
  { to: "/streams", icon: "sensors", labelKey: "nav.live", badge: "live" },
  { to: "/events", icon: "calendar_month", labelKey: "nav.events" },
  { to: "/videos", icon: "smart_display", labelKey: "nav.videos" },
  { to: "/artists", icon: "mic_external_on", labelKey: "nav.artists" },
  { to: "/bands", icon: "groups", labelKey: "nav.bands" },
];

/** Untere Navigation auf dem Handy: die vier wichtigsten Bereiche (plus Konto). */
export const BOTTOM_NAV: NavItem[] = MAIN_NAV.slice(0, 4);

export const LEGAL_LINKS = [
  { to: "/impressum", labelKey: "footer.imprint" },
  { to: "/datenschutz", labelKey: "footer.privacy" },
  { to: "/nutzungsbedingungen", labelKey: "footer.terms" },
  { to: "/kontakt", labelKey: "footer.contact" },
] as const;

/** Ein Eintrag ist aktiv für seine Seite und alle Unterseiten (außer "/", nur exakt). */
export function isNavActive(target: string, path: string): boolean {
  if (target === "/") {
    return path === "/";
  }

  return path === target || path.startsWith(`${target}/`);
}
