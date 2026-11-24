import { intlLocale, placeName, timeZoneOptions } from "../i18n";

/** Kurzer Termin für Badges, z. B. "Mi., 25. Nov., 19:00 MEZ" bzw. "Wed, 25 Nov, 19:00 CET". */
export function formatShortDateTime(value: string): string {
  return new Intl.DateTimeFormat(intlLocale(), {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    ...timeZoneOptions(),
  }).format(new Date(value));
}

/** Ort als "Veranstaltungsort · Stadt" (Stadt optional, im Englischen übersetzt). */
export function joinVenue(name: string, city?: string | null): string {
  return city ? `${name} · ${placeName(city)}` : name;
}
