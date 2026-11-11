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

/** BCP-47-Tag für Intl-Formatierung (Datum, Uhrzeit). */
export function intlLocale(): string {
  return getLocale() === "de" ? "de-DE" : "en-GB";
}

if (typeof document !== "undefined") {
  document.documentElement.lang = getLocale();
}
