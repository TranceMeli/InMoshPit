
<script setup lang="ts">
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
    <h1>Willkommen bei InMoshPit!</h1>
    <p>Du bist angemeldet.</p>

    <button @click="handleLogout">
      Abmelden
    </button>
  </main>
</template>
