
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

    accessToken.value = response.data.access;
    refreshToken.value = response.data.refresh;

    sessionStorage.setItem("access", response.data.access);
    sessionStorage.setItem("refresh", response.data.refresh);
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
    logout,
  };
});
