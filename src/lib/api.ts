import axios from "axios";

const TOKEN_KEY = "wos.admin.token";
const REFRESH_KEY = "wos.admin.refresh";
const USER_KEY = "wos.admin.user";
const MOCK_KEY = "wos.admin.mock";

export interface PlatformSession {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export const adminAuthStore = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  get refreshToken() {
    return localStorage.getItem(REFRESH_KEY);
  },
  get mockMode() {
    return localStorage.getItem(MOCK_KEY) === "1";
  },
  get user(): PlatformSession | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PlatformSession;
    } catch {
      return null;
    }
  },
  setSession(session: PlatformSession, mock = false) {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session));
    if (mock) localStorage.setItem(MOCK_KEY, "1");
    else localStorage.removeItem(MOCK_KEY);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(MOCK_KEY);
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
    if (error.response?.status === 401 && !adminAuthStore.mockMode) adminAuthStore.clear();
    return Promise.reject(error);
  },
);

export interface PlatformLoginResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  recoveryUsed?: boolean;
}

export const platformAuthApi = {
  login: (email: string, password: string, mfaCode?: string, recoveryCode?: string) =>
    adminApi
      .post<PlatformLoginResponse>("/platform/auth/login", {
        email,
        password,
        mfaCode: mfaCode || undefined,
        recoveryCode: recoveryCode || undefined,
      })
      .then((r) => r.data),
};

export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}
