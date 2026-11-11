import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

/** Login und Token-Refresh selbst dürfen nie einen Refresh auslösen. */
const TOKEN_ENDPOINT = "/accounts/token/";

interface RefreshResponse {
  access: string;
  /** Nur vorhanden, wenn das Backend Refresh-Tokens rotiert. */
  refresh?: string;
}

type RetriableRequest = InternalAxiosRequestConfig & { _retried?: boolean };

export interface AuthHooks {
  /** Nach erfolgreichem Refresh, damit der Store seinen Zustand angleicht. */
  onTokensRefreshed?: (access: string, refresh: string | null) => void;
  /** Wenn die Sitzung abgelaufen ist und neu angemeldet werden muss. */
  onSessionExpired?: () => void;
}

let hooks: AuthHooks = {};

export function registerAuthHooks(newHooks: AuthHooks): void {
  hooks = newHooks;
}

api.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem(ACCESS_KEY);

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

function isTokenEndpoint(url: string | undefined): boolean {
  return Boolean(url && url.includes(TOKEN_ENDPOINT));
}

/** Eine laufende Erneuerung wird von allen wartenden Anfragen geteilt. */
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = sessionStorage.getItem(REFRESH_KEY);

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    // Eigener Aufruf ohne diese Interceptors, sonst droht eine Endlosschleife.
    const response = await axios.post<RefreshResponse>(
      `${api.defaults.baseURL ?? ""}${TOKEN_ENDPOINT}refresh/`,
      { refresh: refreshToken },
    );

    const { access, refresh } = response.data;

    sessionStorage.setItem(ACCESS_KEY, access);

    if (refresh) {
      sessionStorage.setItem(REFRESH_KEY, refresh);
    }

    hooks.onTokensRefreshed?.(access, refresh ?? refreshToken);

    return access;
  } catch (error) {
    const status = (error as AxiosError).response?.status;

    // Nur wenn der Server das Refresh-Token ablehnt, ist die Sitzung vorbei.
    // Bei Netzwerkfehlern bleibt der Nutzer angemeldet und kann es erneut versuchen.
    if (status === 400 || status === 401) {
      sessionStorage.removeItem(ACCESS_KEY);
      sessionStorage.removeItem(REFRESH_KEY);
      hooks.onSessionExpired?.();
    }

    throw error;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequest | undefined;

    const shouldRefresh =
      error.response?.status === 401 &&
      request !== undefined &&
      !request._retried &&
      !isTokenEndpoint(request.url) &&
      // Nur Anfragen, die mit einem Token gesendet wurden, können "abgelaufen" sein.
      Boolean(request.headers?.Authorization) &&
      Boolean(sessionStorage.getItem(REFRESH_KEY));

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    request._retried = true;

    try {
      refreshInFlight ??= refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });

      const access = await refreshInFlight;

      request.headers.Authorization = `Bearer ${access}`;

      return api(request);
    } catch {
      // Der ursprüngliche 401-Fehler ist für den Aufrufer aussagekräftiger.
      return Promise.reject(error);
    }
  },
);
