import { beforeEach } from "vitest";

import { setLocale } from "../i18n";

// Tests laufen standardmäßig auf Deutsch, unabhängig von der Browsersprache.
beforeEach(() => {
  setLocale("de");
});
