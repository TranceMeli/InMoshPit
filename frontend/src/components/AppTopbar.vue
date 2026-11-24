<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

import { isWideNow, useBreakpoint } from "../composables/useBreakpoint";
import { t } from "../i18n";
import { useAuthStore } from "../stores/auth";
import { useLayoutStore } from "../stores/layout";
import AppIcon from "./AppIcon.vue";
import LanguageSwitch from "./LanguageSwitch.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const layout = useLayoutStore();
const { isMobile } = useBreakpoint();

const query = ref(typeof route.query.q === "string" ? route.query.q : "");
const searchOpen = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);

const menuOpen = ref(false);
const accountRoot = ref<HTMLElement | null>(null);

// Das Suchfeld zeigt den aktuellen Suchbegriff, auch nach Zurück/Vor im Browser.
watch(
  () => route.query.q,
  (value) => {
    query.value = typeof value === "string" ? value : "";
  },
);

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
    searchOpen.value = false;
  },
);

function toggleMenu() {
  layout.toggleMenu({ wide: isWideNow(), compact: Boolean(route.meta.compactNav) });
}

async function openSearch() {
  searchOpen.value = true;
  await nextTick();
  searchInput.value?.focus();
}

function submitSearch() {
  const q = query.value.trim();

  if (!q) {
    return;
  }

  router.push({ name: "search", query: { q } });
}

function logout() {
  menuOpen.value = false;
  authStore.logout();
  router.push("/");
}

function onDocumentClick(event: MouseEvent) {
  if (menuOpen.value && !accountRoot.value?.contains(event.target as Node)) {
    menuOpen.value = false;
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    menuOpen.value = false;
    searchOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <header class="topbar" :class="{ 'topbar--search': searchOpen }">
    <div class="topbar-start">
      <button
        type="button"
        class="icon-button"
        :aria-label="t('nav.toggleMenu')"
        :aria-expanded="layout.drawerOpen"
        @click="toggleMenu"
      >
        <AppIcon name="menu" size="1.5rem" />
      </button>

      <RouterLink to="/" class="brand" :aria-label="t('nav.homeLink')">
        <span class="brand-mark" aria-hidden="true">
          <AppIcon name="graphic_eq" filled size="1.1rem" />
        </span>
        <span class="brand-name">InMoshPit</span>
      </RouterLink>
    </div>

    <form class="search" role="search" @submit.prevent="submitSearch">
      <button
        v-if="searchOpen"
        type="button"
        class="icon-button search-back"
        :aria-label="t('nav.closeSearch')"
        @click="searchOpen = false"
      >
        <AppIcon name="arrow_back" size="1.5rem" />
      </button>

      <input
        ref="searchInput"
        v-model="query"
        type="search"
        name="q"
        autocomplete="off"
        :placeholder="t('search.placeholder')"
        :aria-label="t('search.label')"
      />

      <button type="submit" class="search-submit" :aria-label="t('common.search')">
        <AppIcon name="search" size="1.4rem" />
      </button>
    </form>

    <div class="topbar-end">
      <button
        v-if="isMobile"
        type="button"
        class="icon-button"
        :aria-label="t('nav.openSearch')"
        @click="openSearch"
      >
        <AppIcon name="search" size="1.5rem" />
      </button>

      <LanguageSwitch />

      <div v-if="authStore.isAuthenticated" ref="accountRoot" class="account">
        <button
          type="button"
          class="icon-button"
          aria-haspopup="menu"
          :aria-expanded="menuOpen"
          :aria-label="t('nav.accountMenu')"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon name="account_circle" size="2rem" />
        </button>

        <ul v-if="menuOpen" class="account-menu" role="menu">
          <li role="none">
            <RouterLink to="/dashboard" role="menuitem">
              <AppIcon name="dashboard" size="1.25rem" />
              {{ t('nav.dashboard') }}
            </RouterLink>
          </li>
          <li role="none">
            <button type="button" role="menuitem" @click="logout">
              <AppIcon name="logout" size="1.25rem" />
              {{ t('nav.logout') }}
            </button>
          </li>
        </ul>
      </div>

      <template v-else>
        <RouterLink to="/register" class="link-button link-button--ghost">
          {{ t('nav.register') }}
        </RouterLink>
        <RouterLink to="/login" class="link-button">
          <AppIcon name="account_circle" size="1.25rem" />
          {{ t('nav.login') }}
        </RouterLink>
      </template>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  height: var(--topbar-height);
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1rem;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-divider);
}

.topbar-start,
.topbar-end {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.topbar-end {
  gap: 0.75rem;
}

.icon-button {
  display: inline-grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  color: var(--color-text);
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.icon-button:hover {
  background: var(--color-surface-2);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  text-decoration: none;
}

.brand:hover {
  color: var(--color-text);
}

.brand-mark {
  display: grid;
  width: 1.9rem;
  height: 1.9rem;
  place-items: center;
  color: var(--color-on-live);
  background: var(--color-live);
  border-radius: 0.55rem;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.search {
  display: flex;
  flex: 1;
  max-width: 640px;
  align-items: center;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
}

.search:focus-within {
  border-color: var(--color-accent);
}

.search input {
  flex: 1;
  min-width: 0;
  padding: 0.55rem 1rem;
  color: var(--color-text);
  background: transparent;
  border: 0;
  outline: none;
  font: inherit;
}

.search-submit {
  display: grid;
  width: 3.2rem;
  align-self: stretch;
  place-items: center;
  color: var(--color-text);
  background: var(--color-surface-2);
  border: 0;
  border-left: 1px solid var(--color-border-strong);
  cursor: pointer;
}

.account {
  position: relative;
}

.account-menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 60;
  min-width: 12rem;
  margin: 0;
  padding: 0.4rem;
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  box-shadow: 0 12px 30px #0b0b0b55;
}

.account-menu a,
.account-menu button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  color: var(--color-text);
  background: transparent;
  border: 0;
  border-radius: 0.5rem;
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.account-menu a:hover,
.account-menu button:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.link-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.link-button:hover {
  color: var(--color-on-primary);
  background: var(--color-primary-hover);
}

.link-button--ghost {
  color: var(--color-text);
  background: transparent;
}

.link-button--ghost:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.search-back {
  margin-left: 0.25rem;
}

/* Mittlere Breiten: Registrieren entfällt, "Anmelden" bleibt */
@media (max-width: 899px) {
  .link-button--ghost {
    display: none;
  }
}

/* Handy: kompakte Leiste, Suche als eigene Ansicht */
@media (max-width: 767px) {
  .topbar {
    padding: 0 0.5rem;
    gap: 0.25rem;
  }

  .search {
    display: none;
  }

  .brand-name {
    display: none;
  }

  .topbar--search .topbar-start,
  .topbar--search .topbar-end {
    display: none;
  }

  .topbar--search .search {
    display: flex;
    max-width: none;
  }
}
</style>
