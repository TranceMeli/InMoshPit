
<script setup lang="ts">
import { t } from "../i18n";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push("/login");
}
</script>

<template>
  <main>
    <h1>{{ t('dashboard.welcome') }}</h1>
    <p>{{ t('dashboard.signedIn') }}</p>

    <button @click="handleLogout">
      {{ t('dashboard.logout') }}
    </button>
  </main>
</template>
