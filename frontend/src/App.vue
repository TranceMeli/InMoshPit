<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";

import AppSidebar from "./components/AppSidebar.vue";
import AppTopbar from "./components/AppTopbar.vue";
import BottomNav from "./components/BottomNav.vue";
import { t } from "./i18n";
import { useLayoutStore } from "./stores/layout";

const layout = useLayoutStore();

const LIVE_REFRESH_MS = 60_000;
let liveTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  layout.refreshLive();
  liveTimer = setInterval(() => layout.refreshLive(), LIVE_REFRESH_MS);
});

onBeforeUnmount(() => clearInterval(liveTimer));
</script>

<template>
  <a class="skip-link" href="#content">{{ t('nav.skip') }}</a>

  <AppTopbar />

  <div class="shell">
    <AppSidebar />

    <!-- Die Seiten bringen ihr eigenes <main> mit, daher hier ein neutraler Container. -->
    <div id="content" class="content" tabindex="-1">
      <RouterView />
    </div>
  </div>

  <BottomNav />
</template>

<style>
#app {
  min-height: 100vh;
}

.shell {
  display: flex;
  align-items: flex-start;
}

.content {
  min-width: 0;
  min-height: calc(100vh - var(--topbar-height));
  flex: 1;
  outline: none;
}

.skip-link {
  position: absolute;
  top: 0;
  left: 0.5rem;
  z-index: 100;
  padding: 0.6rem 1rem;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border-radius: 0 0 0.5rem 0.5rem;
  transform: translateY(-120%);
}

.skip-link:focus {
  color: var(--color-on-primary);
  transform: translateY(0);
}

/* Platz für die untere Navigation auf dem Handy */
@media (max-width: 767px) {
  .content {
    padding-bottom: 4.5rem;
  }
}
</style>
