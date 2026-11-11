
<script setup lang="ts">
import { t } from "../i18n";
import { computed } from "vue";
import { useRoute } from "vue-router";

const currentRoute = useRoute();

const pageKeys = ["impressum", "datenschutz", "kontakt", "nutzungsbedingungen"];

const page = computed(() => {
  const key = currentRoute.path.split("/").filter(Boolean).pop() ?? "";
  const pageKey = pageKeys.includes(key) ? key : "fallback";

  return {
    title: t(`legal.${pageKey}.title`),
    description: t(`legal.${pageKey}.description`),
  };
});
</script>

<template>
  <main class="legal-page">
    <div class="legal-content">
      <p class="eyebrow">INMOSHPIT INFORMATION</p>
      <h1>{{ page.title }}</h1>
      <p>{{ page.description }}</p>

      <p class="notice">
        {{ t('legal.notice') }}
      </p>
    </div>
  </main>
</template>

<style scoped>
.legal-page {
  min-height: 55vh;
  padding: 4rem max(1.5rem, calc((100% - 900px) / 2));
  background: var(--color-bg);
  color: var(--color-text);
}

.legal-content {
  max-width: 700px;
}

.eyebrow {
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

h1 {
  font-family: var(--font-display, "Cabinet Grotesk", sans-serif);
  font-size: clamp(2rem, 5vw, 3rem);
}

.legal-content > p {
  color: var(--color-muted);
  line-height: 1.7;
}

.notice {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
}
</style>
