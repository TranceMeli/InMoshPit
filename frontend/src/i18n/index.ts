import { createI18n } from "vue-i18n";

import de from "./locales/de.json";
import en from "./locales/en.json";

export type Locale = "de" | "en";

export const SUPPORTED_LOCALES: readonly Locale[] = ["de", "en"];

const STORAGE_KEY = "locale";

function isLocale(value: unknown): value is Locale {
  return value === "de" || value === "en";
}

/** Gespeicherte Auswahl, sonst Browsersprache (de* -> de, sonst en). */
function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      return stored;
    }
  } catch {
    // localStorage nicht verfügbar (z. B. privater Modus) – ignorieren.
  }

  const browserLanguage =
    typeof navigator !== "undefined" ? navigator.language : "de";

  return browserLanguage.toLowerCase().startsWith("de") ? "de" : "en";
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: "de",
  messages: { de, en },
});

/**
 * Globale Übersetzungsfunktion. Sie liest die aktuelle Sprache reaktiv,
 * kann also direkt in Templates und Skripten genutzt werden, ohne dass
 * das i18n-Plugin installiert sein muss (praktisch für Unit-Tests).
 */
export const t = i18n.global.t;

export function getLocale(): Locale {
  return i18n.global.locale.value as Locale;
}

export function setLocale(locale: Locale): void {
  i18n.global.locale.value = locale;

  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Auswahl wird dann nur für diese Sitzung gehalten.
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}

/**
 * Englische Namen für Orte und Länder, die in der Datenbank deutsch gepflegt
 * sind. Unbekannte Namen werden unverändert angezeigt.
 */
const PLACE_NAMES_EN: Record<string, string> = {
  // Städte
  Wien: "Vienna",
  München: "Munich",
  Köln: "Cologne",
  Nürnberg: "Nuremberg",
  Zürich: "Zurich",
  Prag: "Prague",
  Warschau: "Warsaw",
  Mailand: "Milan",
  Rom: "Rome",
  Lissabon: "Lisbon",
  Kopenhagen: "Copenhagen",
  Brüssel: "Brussels",
  Genf: "Geneva",
  Venedig: "Venice",
  // Länder
  Deutschland: "Germany",
  Österreich: "Austria",
  Schweiz: "Switzerland",
  Niederlande: "Netherlands",
  Frankreich: "France",
  Italien: "Italy",
  Spanien: "Spain",
  Polen: "Poland",
  Tschechien: "Czechia",
  Ungarn: "Hungary",
  Belgien: "Belgium",
  Dänemark: "Denmark",
  Schweden: "Sweden",
  "Vereinigtes Königreich": "United Kingdom",
};

/** Ortsname in der aktuellen Sprache (Stadt oder Land). */
export function placeName(value: string): string {
  if (getLocale() !== "en") {
    return value;
  }

  return PLACE_NAMES_EN[value.trim()] ?? value;
}

/**
 * Uhrzeiten werden im Englischen mit Zeitzone angezeigt, weil Gäste aus
 * anderen Ländern die Ortszeit der Veranstaltung sonst nicht einordnen können.
 */
export function timeZoneOptions(): Intl.DateTimeFormatOptions {
  return getLocale() === "en" ? { timeZoneName: "short" } : {};
}

/** BCP-47-Tag für Intl-Formatierung (Datum, Uhrzeit). */
export function intlLocale(): string {
  return getLocale() === "de" ? "de-DE" : "en-GB";
}

if (typeof document !== "undefined") {
  document.documentElement.lang = getLocale();
}
