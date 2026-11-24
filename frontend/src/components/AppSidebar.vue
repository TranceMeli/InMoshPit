<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

import { useBreakpoint } from "../composables/useBreakpoint";
import { t } from "../i18n";
import { LEGAL_LINKS, MAIN_NAV, isNavActive } from "../navigation";
import { useLayoutStore } from "../stores/layout";
import AppIcon from "./AppIcon.vue";

const route = useRoute();
const layout = useLayoutStore();
const { isWide, isMobile } = useBreakpoint();

const drawer = ref<HTMLElement | null>(null);
const year = new Date().getFullYear();

/**
 * Darstellung der Leiste:
 *  - drawer:   Overlay mit Beschriftungen (Menü-Schaltfläche auf schmalen Seiten
 *              und auf Zuschauer-Seiten)
 *  - expanded: breite Leiste mit Beschriftungen
 *  - rail:     schmale Icon-Leiste mit kleiner Beschriftung
 */
const base = computed<"expanded" | "rail">(() =>
  isWide.value && !route.meta.compactNav && layout.preference === "expanded"
    ? "expanded"
    : "rail",
);

const variant = computed<"drawer" | "expanded" | "rail">(() =>
  layout.drawerOpen ? "drawer" : base.value,
);

/** Auf dem Handy gibt es keine feste Leiste, nur den Drawer. */
const hidden = computed(() => isMobile.value && !layout.drawerOpen);

/**
 * Der Platzhalter behält seine Breite, auch wenn die Leiste als Drawer über
 * dem Inhalt liegt. So springt der Inhalt beim Öffnen nicht zur Seite.
 */
const slot = computed(() => (isMobile.value ? "none" : base.value));

const showLabelsInline = computed(() => variant.value !== "rail");

watch(
  () => route.fullPath,
  () => layout.closeDrawer(),
);

watch(
  () => layout.drawerOpen,
  async (open) => {
    if (open) {
      await nextTick();
      drawer.value?.querySelector<HTMLElement>("a, button")?.focus();
    }
  },
);

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && layout.drawerOpen) {
    layout.closeDrawer();
  }
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="sidebar-slot" :class="`sidebar-slot--${slot}`">
  <div v-if="layout.drawerOpen" class="backdrop" @click="layout.closeDrawer()" />

  <aside
    v-show="!hidden"
    ref="drawer"
    class="sidebar"
    :class="`sidebar--${variant}`"
    :aria-label="t('nav.main')"
  >
    <nav>
      <ul class="nav-list">
        <li v-for="item in MAIN_NAV" :key="item.to">
          <RouterLink
            :to="item.to"
            class="nav-item"
            :class="{ active: isNavActive(item.to, route.path) }"
            :aria-current="isNavActive(item.to, route.path) ? 'page' : undefined"
            :title="showLabelsInline ? undefined : t(item.labelKey)"
          >
            <AppIcon :name="item.icon" :filled="isNavActive(item.to, route.path)" size="1.5rem" />
            <span class="nav-label">{{ t(item.labelKey) }}</span>
            <span
              v-if="item.badge === 'live' && layout.liveCount > 0"
              class="nav-badge"
              :aria-label="t('nav.liveCount', layout.liveCount)"
            >
              {{ layout.liveCount }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <footer v-if="showLabelsInline" class="legal">
      <ul>
        <li v-for="link in LEGAL_LINKS" :key="link.to">
          <RouterLink :to="link.to">{{ t(link.labelKey) }}</RouterLink>
        </li>
      </ul>

      <p>© {{ year }} InMoshPit</p>
    </footer>
  </aside>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: #0b0b0b99;
}

.sidebar-slot {
  flex: none;
}

.sidebar-slot--rail {
  width: var(--sidebar-rail);
}

.sidebar-slot--expanded {
  width: var(--sidebar-expanded);
}

.sidebar-slot--none {
  width: 0;
}

.sidebar {
  position: sticky;
  top: var(--topbar-height);
  z-index: 10;
  display: flex;
  flex: none;
  flex-direction: column;
  height: calc(100vh - var(--topbar-height));
  overflow-y: auto;
  background: var(--color-bg);
  padding: 0.5rem;
}

.sidebar--rail,
.sidebar--expanded {
  width: 100%;
}

.sidebar--drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  width: min(280px, 85vw);
  height: 100vh;
  border-right: 1px solid var(--color-divider);
  box-shadow: 0 0 40px #0b0b0b66;
}

.nav-list,
.legal ul {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--color-text);
  border-radius: 0.75rem;
  text-decoration: none;
}

.nav-item:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.nav-item.active {
  background: var(--color-surface-2);
  font-weight: 700;
}

.nav-badge {
  min-width: 1.1rem;
  padding: 0 0.3rem;
  color: var(--color-on-live);
  background: var(--color-live);
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 800;
  line-height: 1.1rem;
  text-align: center;
}

/* Schmale Leiste: Icon über kleiner Beschriftung */
.sidebar--rail .nav-item {
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.7rem 0 0.5rem;
}

.sidebar--rail .nav-label {
  font-size: 0.6875rem;
  line-height: 1;
}

.sidebar--rail .nav-badge {
  position: absolute;
  top: 0.35rem;
  left: calc(50% + 0.35rem);
}

/* Breite Leiste und Drawer: Icon neben Beschriftung */
.sidebar--expanded .nav-item,
.sidebar--drawer .nav-item {
  gap: 1.25rem;
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
}

.sidebar--expanded .nav-badge,
.sidebar--drawer .nav-badge {
  margin-left: auto;
}

.legal {
  margin-top: auto;
  padding: 1rem 0.9rem 0.5rem;
  border-top: 1px solid var(--color-divider);
}

.legal ul {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.25rem 0.9rem;
}

.legal a {
  color: var(--color-muted);
  font-size: 0.75rem;
  text-decoration: none;
}

.legal a:hover {
  color: var(--color-text);
  text-decoration: underline;
}

.legal p {
  margin: 0.75rem 0 0;
  color: var(--color-faint);
  font-size: 0.75rem;
}
</style>
