
<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<template>
  <div class="app-layout">
    <AppHeader />

    <div class="app-content">
      <RouterView />
    </div>

    <AppFooter />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
}

.app-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.app-content {
  flex: 1;
}
</style>
