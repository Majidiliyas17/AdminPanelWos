import axios, { type AxiosResponse } from "axios";

const TOKEN_KEY = "wos.admin.token";
const REFRESH_KEY = "wos.admin.refresh";
const USER_KEY = "wos.admin.user";

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
  get user(): PlatformSession | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PlatformSession;
    } catch {
      return null;
    }
  },
  setSession(session: PlatformSession) {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const adminApi = axios.create({ baseURL: "/api/v1", timeout: 30000 });

adminApi.interceptors.request.use((config) => {
  const token = adminAuthStore.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface EnvelopedBody {
  success: boolean;
  data?: unknown;
  meta?: unknown;
}

function unwrapEnvelope(response: AxiosResponse): AxiosResponse {
  const body = response.data as EnvelopedBody | undefined;
  if (
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    typeof body.success === "boolean" &&
    "data" in body
  ) {
    response.data = body.data;
    if (body.meta)
      (response as AxiosResponse & { meta?: unknown }).meta = body.meta;
  }
  return response;
}

adminApi.interceptors.response.use(
  (res) => unwrapEnvelope(res),
  (error) => {
    if (error.response?.status === 401) adminAuthStore.clear();
    return Promise.reject(error);
  },
);

export class ApiError extends Error {
  readonly status?: number;
  readonly endpoint?: string;

  constructor(
    message: string,
    options: { status?: number; endpoint?: string; cause?: unknown } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.endpoint = options.endpoint;
    if (options.cause !== undefined) this.cause = options.cause;
  }
}

function serverMessage(data: unknown): string | null {
  if (!data || typeof data !== "object")
    return typeof data === "string" && data ? data : null;
  const body = data as {
    error?: unknown;
    message?: string;
    detail?: string;
    title?: string;
  };
  if (typeof body.error === "string" && body.error) return body.error;
  if (body.error && typeof body.error === "object") {
    const nested = body.error as {
      message?: string;
      title?: string;
      description?: string;
    };
    const text = nested.message ?? nested.description ?? nested.title;
    if (text) return text;
  }
  return body.message ?? body.detail ?? body.title ?? null;
}

export function describeApiError(error: unknown): string {
  if (error instanceof ApiError) return error.message;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const method = (error.config?.method ?? "get").toUpperCase();
    const url = error.config?.url ?? "";
    const detail = serverMessage(error.response?.data);

    if (!error.response) {
      return "Backend unreachable — API server chal nahi raha (localhost:5234). Server check karein.";
    }
    if (status === 401)
      return detail ?? "Session expired — please sign in again.";
    if (status === 403)
      return (
        detail ?? "You don't have permission for this data (SuperAdmin only)."
      );
    if (status === 404) return `Endpoint not found — ${method} ${url}.`;
    if (status === 429) return "Too many requests — thodi der baad try karein.";
    if (status && status >= 500)
      return `Backend error ${status}${detail ? ` — ${detail}` : "."}`;
    return `Request failed${status ? ` (${status})` : ""}${detail ? ` — ${detail}` : "."}`;
  }

  if (error instanceof Error) return error.message;
  return String(error);
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    return new ApiError(describeApiError(error), {
      status: error.response?.status,
      endpoint: error.config?.url,
      cause: error,
    });
  }
  return new ApiError(error instanceof Error ? error.message : String(error), {
    cause: error,
  });
}

export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

export interface PlatformLoginResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  recoveryUsed?: boolean;
}

export const platformAuthApi = {
  login: (
    email: string,
    password: string,
    mfaCode?: string,
    recoveryCode?: string,
  ) =>
    adminApi
      .post<PlatformLoginResponse>("/platform/auth/login", {
        email,
        password,
        mfaCode: mfaCode || undefined,
        recoveryCode: recoveryCode || undefined,
      })
      .then((r) => r.data),
};
