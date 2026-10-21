import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Warehouse } from "lucide-react";
import { useAdminAuth } from "@/lib/auth";
import { PLATFORM_ACCOUNT } from "@/lib/consoleConfig";
import { describeApiError } from "@/lib/api";
import { toast } from "@/lib/toast";

export function AdminLoginPage() {
  const { user, login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(PLATFORM_ACCOUNT.email);
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password, totpCode || undefined);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = describeApiError(err);
      setError(message);
      toast.error("Sign-in failed", message, "login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid h-full place-items-center bg-[#f5f6f8] px-6">
      <form onSubmit={onSubmit} className="w-full max-w-[320px] pb-12">
        <div className="mb-5 flex flex-col items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-violet text-white">
            <Warehouse className="size-6" />
          </span>
          <span className="text-[18px] font-bold text-ink-900">
            Warehouse<span className="text-brand-violet">OS</span>
          </span>
          <span className="rounded-full bg-violet-tint px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-brand-violet">
            PLATFORM CONSOLE
          </span>
        </div>

        <h1 className="text-center text-[26px] font-bold text-ink-900">
          Super Admin Sign In
        </h1>
        <p className="mt-1 mb-6 text-center text-[13px] text-ink-500">
          Restricted access · platform staff only
        </p>

        <label className="mb-3 block text-[11px] font-semibold text-[#374151]">
          Work Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@warehouseos.com"
            className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-brand-violet"
          />
        </label>
        <label className="mb-3 block text-[11px] font-semibold text-[#374151]">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-brand-violet"
          />
        </label>
        <label className="mb-4 block text-[11px] font-semibold text-[#374151]">
          2FA Code
          <input
            inputMode="numeric"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            placeholder="6-digit authenticator code"
            className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-3 font-mono text-[12px] outline-none focus:border-brand-violet"
          />
        </label>

        {error && (
          <p className="mb-3 rounded-lg bg-danger-tint px-3 py-2 text-[11px] text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-9 w-full rounded-lg bg-brand-violet text-[13px] font-semibold text-white hover:bg-[#6d28d9] disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign In to Console"}
        </button>

        <p className="mt-4 text-center text-[11px] text-ink-500">
          Every sign-in is logged and reviewed for security.
        </p>
      </form>

      <footer className="fixed right-0 bottom-0 left-0 flex h-7 items-center justify-between border-t border-line bg-white px-4 text-[10px] text-ink-500">
        <span className="font-bold text-ink-900">WarehouseOS</span>
        <span>Super Admin · Login</span>
        <span>Page 143 / 158</span>
      </footer>
    </div>
  );
}
