import { createContext, useContext, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { adminAuthStore, platformAuthApi, type PlatformSession } from "@/lib/api";
import { toast } from "@/lib/toast";

interface AdminAuthState {
  user: PlatformSession | null;
  login: (email: string, password: string, mfaCode?: string, recoveryCode?: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformSession | null>(() => adminAuthStore.user);

  async function login(email: string, password: string, mfaCode?: string, recoveryCode?: string) {
    // Mock login hataya — jo bhi error aaye, user ko toast me dikhega.
    const session = await platformAuthApi.login(email, password, mfaCode, recoveryCode);
    const mapped: PlatformSession = {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      token: session.token,
    };
    adminAuthStore.setSession(mapped);
    setUser(mapped);
    toast.success("Signed in", `Welcome back, ${mapped.name}.`);
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
