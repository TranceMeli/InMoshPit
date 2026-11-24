<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

import { useBreakpoint } from "../composables/useBreakpoint";
import { t } from "../i18n";
import { BOTTOM_NAV, isNavActive } from "../navigation";
import { useAuthStore } from "../stores/auth";
import { useLayoutStore } from "../stores/layout";
import AppIcon from "./AppIcon.vue";

const route = useRoute();
const authStore = useAuthStore();
const layout = useLayoutStore();
const { isMobile } = useBreakpoint();

/** Letzter Eintrag: Konto, je nach Anmeldestatus Dashboard oder Anmelden. */
const account = computed(() =>
  authStore.isAuthenticated
    ? { to: "/dashboard", icon: "dashboard" as const, labelKey: "nav.dashboard" }
    : { to: "/login", icon: "account_circle" as const, labelKey: "nav.login" },
);
</script>

<template>
  <nav v-if="isMobile" class="bottom-nav" :aria-label="t('nav.mobile')">
    <RouterLink
      v-for="item in BOTTOM_NAV"
      :key="item.to"
      :to="item.to"
      class="bottom-item"
      :class="{ active: isNavActive(item.to, route.path) }"
      :aria-current="isNavActive(item.to, route.path) ? 'page' : undefined"
    >
      <span class="bottom-icon">
        <AppIcon :name="item.icon" :filled="isNavActive(item.to, route.path)" size="1.5rem" />
        <span v-if="item.badge === 'live' && layout.liveCount > 0" class="bottom-badge">
          {{ layout.liveCount }}
        </span>
      </span>
      {{ t(item.labelKey) }}
    </RouterLink>

    <RouterLink
      :to="account.to"
      class="bottom-item"
      :class="{ active: isNavActive(account.to, route.path) }"
      :aria-current="isNavActive(account.to, route.path) ? 'page' : undefined"
    >
      <AppIcon :name="account.icon" :filled="isNavActive(account.to, route.path)" size="1.5rem" />
      {{ t(account.labelKey) }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  display: flex;
  justify-content: space-around;
  padding: 0.35rem 0 calc(0.35rem + env(safe-area-inset-bottom));
  background: var(--color-bg);
  border-top: 1px solid var(--color-divider);
}

.bottom-item {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.25rem 0;
  color: var(--color-muted);
  font-size: 0.6875rem;
  text-decoration: none;
}

.bottom-item:hover,
.bottom-item.active {
  color: var(--color-text);
}

.bottom-item.active {
  font-weight: 700;
}

.bottom-icon {
  position: relative;
  display: inline-flex;
}

.bottom-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.6rem;
  min-width: 1.05rem;
  padding: 0 0.28rem;
  color: var(--color-on-live);
  background: var(--color-live);
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 800;
  line-height: 1.05rem;
  text-align: center;
}
</style>
