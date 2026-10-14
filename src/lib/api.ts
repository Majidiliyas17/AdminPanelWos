import axios from "axios";

const TOKEN_KEY = "wos.admin.token";
const REFRESH_KEY = "wos.admin.refresh";

export const adminAuthStore = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  get refreshToken() {
    return localStorage.getItem(REFRESH_KEY);
  },
  setSession(token: string, refreshToken?: string | null) {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const adminApi = axios.create({ baseURL: "/api/v1", timeout: 30000 });

adminApi.interceptors.request.use((config) => {
  const token = adminAuthStore.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) adminAuthStore.clear();
    return Promise.reject(error);
  },
);

export interface PlatformLoginResponse {
  id: string;
  email: string;
  displayName: string;
  token: string;
  refreshToken?: string | null;
}

export const platformAuthApi = {
  login: (email: string, password: string, totpCode?: string) =>
    adminApi
      .post<PlatformLoginResponse>("/platform/auth/login", { email, password, totpCode })
      .then((r) => r.data),
};
