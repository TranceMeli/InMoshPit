
<script setup lang="ts">
import { t } from "../i18n";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

async function handleLogin() {
  errorMessage.value = "";
  isLoading.value = true;

  try {
    await authStore.login(username.value, password.value);

    await router.push("/dashboard");
  } catch (error: any) {
    if (error.response?.status === 401) {
      errorMessage.value = t('auth.login.invalid');
    } else {
      errorMessage.value = t('auth.login.failed');
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <main class="auth-container">
    <section class="auth-card">
      <h1>InMoshPit</h1>
      <h2>{{ t('auth.login.title') }}</h2>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">{{ t('auth.username') }}</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">{{ t('auth.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? t('auth.login.submitting') : t('auth.login.submit') }}
        </button>
      </form>

      <p class="auth-link">
        {{ t('auth.login.noAccount') }}
        <RouterLink to="/register">{{ t('auth.register.submit') }}</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

h1,
h2 {
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

label {
  font-weight: 600;
}

input {
  padding: 0.75rem;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
}

button {
  width: 100%;
  padding: 0.8rem;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: 0;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
  transition: background var(--transition);
}

button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.error-message {
  color: var(--color-error);
}

.auth-link {
  text-align: center;
  margin-top: 1.5rem;
}
</style>
