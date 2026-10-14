import { createContext, useContext, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { adminAuthStore, platformAuthApi, type PlatformLoginResponse } from "@/lib/api";

interface AdminAuthState {
  user: PlatformLoginResponse | null;
  login: (email: string, password: string, totpCode?: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformLoginResponse | null>(() =>
    adminAuthStore.token ? { id: "", email: "", displayName: "Riya Kapoor", token: adminAuthStore.token } : null,
  );

  async function login(email: string, password: string, totpCode?: string) {
    const session = await platformAuthApi.login(email, password, totpCode);
    adminAuthStore.setSession(session.token, session.refreshToken ?? null);
    setUser(session);
  }

  function logout() {
    adminAuthStore.clear();
    setUser(null);
  }

  return <AdminAuthContext.Provider value={{ user, login, logout }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const { user } = useAdminAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
