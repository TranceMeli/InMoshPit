
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../services/api";

const router = useRouter();

const username = ref("");
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");

const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

async function register() {
  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await api.post("/accounts/register/", {
      username: username.value,
      email: email.value,
      password: password.value,
      password_confirm: passwordConfirm.value,
    });

    successMessage.value =
      "Dein Account wurde erfolgreich erstellt.";

    username.value = "";
    email.value = "";
    password.value = "";
    passwordConfirm.value = "";

    await router.push("/login");
  } catch (error: any) {
    const data = error.response?.data;

    if (data && typeof data === "object") {
      errorMessage.value = Object.entries(data)
        .map(([field, messages]) => {
          const message = Array.isArray(messages)
            ? messages.join(" ")
            : String(messages);

          return `${field}: ${message}`;
        })
        .join("\n");
    } else {
      errorMessage.value =
        "Die Registrierung ist fehlgeschlagen. Bitte versuche es erneut.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <header class="auth-header">
        <h1>InMoshPit</h1>
        <p>Werde Teil der Live-Musik-Community.</p>
      </header>

      <form @submit.prevent="register">
        <div class="form-group">
          <label for="username">Benutzername</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">E-Mail-Adresse</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Passwort</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </div>

        <div class="form-group">
          <label for="password-confirm">
            Passwort wiederholen
          </label>
          <input
            id="password-confirm"
            v-model="passwordConfirm"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </div>

        <p v-if="errorMessage" class="message error">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="message success">
          {{ successMessage }}
        </p>

        <button type="submit" :disabled="loading">
          {{ loading ? "Account wird erstellt..." : "Registrieren" }}
        </button>
      </form>

      <footer>
        Du hast bereits einen Account?
        <RouterLink to="/login">Jetzt anmelden</RouterLink>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: var(--color-bg);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 2rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 24px #24164014;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  margin-bottom: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

input {
  padding: 0.75rem;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 6px;
  font: inherit;
}

button {
  width: 100%;
  padding: 0.85rem;
  color: var(--color-on-primary);
  background: var(--color-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.message {
  white-space: pre-line;
  font-size: 0.9rem;
}

.error {
  color: var(--color-error);
}

.success {
  color: var(--color-success);
}

footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}
</style>
