<script setup lang="ts">
import { computed } from "vue";

import { SUPPORTED_LOCALES, getLocale, setLocale, t, type Locale } from "../i18n";

const currentLocale = computed(() => getLocale());

function select(locale: Locale) {
  setLocale(locale);
}
</script>

<template>
  <div class="language-switcher" role="group" :aria-label="t('nav.language')">
    <button
      v-for="locale in SUPPORTED_LOCALES"
      :key="locale"
      type="button"
      class="language-option"
      :class="{ active: currentLocale === locale }"
      :aria-pressed="currentLocale === locale"
      :lang="locale"
      :title="t(locale === 'de' ? 'nav.languageDe' : 'nav.languageEn')"
      @click="select(locale)"
    >
      {{ locale.toUpperCase() }}
    </button>
  </div>
</template>

<style scoped>
.language-switcher {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid var(--color-border-strong);
  border-radius: 0.5rem;
}

.language-option {
  padding: 0.35rem 0.6rem;
  color: var(--color-muted);
  background: transparent;
  border: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.language-option:hover {
  color: var(--color-text);
}

.language-option.active {
  color: var(--color-on-primary);
  background: var(--color-primary);
}
</style>
