
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "../services/api";

interface LoginResponse {
  access: string;
  refresh: string;
}

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(
    sessionStorage.getItem("access")
  );

  const refreshToken = ref<string | null>(
    sessionStorage.getItem("refresh")
  );

  const isAuthenticated = computed(
    () => accessToken.value !== null
  );

  async function login(username: string, password: string) {
    const response = await api.post<LoginResponse>(
      "/accounts/token/",
      {
        username,
        password,
      }
    );

    setTokens(response.data.access, response.data.refresh);
  }

  /** Übernimmt neue Tokens (Login oder automatischer Refresh). */
  function setTokens(access: string, refresh: string | null) {
    accessToken.value = access;
    refreshToken.value = refresh;

    sessionStorage.setItem("access", access);

    if (refresh) {
      sessionStorage.setItem("refresh", refresh);
    }
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;

    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
  }

  return {
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    setTokens,
    logout,
  };
});
