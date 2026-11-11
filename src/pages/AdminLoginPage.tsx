import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Warehouse,
} from "lucide-react";
import { useAdminAuth } from "@/lib/auth";
import { describeApiError } from "@/lib/api";
import { toast } from "@/lib/toast";

export function AdminLoginPage() {
  const { user, login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
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
    <div className="grid min-h-full lg:grid-cols-[1.05fr_1fr]">
      <div className="grid place-items-center px-6 py-10 sm:px-10">
        <form onSubmit={onSubmit} className="w-full max-w-[340px]">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-brand-violet text-white shadow-[0_12px_28px_-12px_rgb(124_108_255/90%)]">
              <Warehouse className="size-5" />
            </span>
            <span className="text-[19px] font-bold tracking-tight text-ink-900">
              Warehouse<span className="text-brand-violet">OS</span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-violet/30 bg-violet-tint px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.12em] text-brand-violet uppercase">
            <ShieldCheck className="size-3" /> Platform console
          </span>
          <h1 className="mt-3 text-[26px] leading-tight font-bold tracking-tight text-ink-900">
            Super admin sign in
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-500">
            Restricted access · platform staff only.
          </p>

          <div className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-ink-700">
                Work email
              </span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@warehouseos.com"
                  className="h-11 w-full rounded-xl border border-line bg-surface-2 pr-3 pl-10 text-[13.5px] text-ink-900 outline-none placeholder:text-ink-muted focus:border-brand-violet"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-ink-700">
                Password
              </span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-11 w-full rounded-xl border border-line bg-surface-2 pr-11 pl-10 text-[13.5px] text-ink-900 outline-none placeholder:text-ink-muted focus:border-brand-violet"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-ink-muted hover:bg-surface-3 hover:text-ink-900"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-danger/25 bg-danger-tint px-3 py-2 text-[12px] text-danger"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="group mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[13.5px] font-semibold text-white shadow-[0_14px_30px_-14px_rgb(124_108_255/90%)] hover:bg-primary-dark disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in to console"}
            {!busy && (
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11.5px] text-ink-muted">
            <ShieldCheck className="size-3.5" />
            Every sign-in is logged and reviewed for security.
          </p>
        </form>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-line bg-sidebar lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute inset-0 wos-grid-texture opacity-50" />
        <div className="pointer-events-none absolute -top-32 -right-20 size-[420px] rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-[340px] rounded-full bg-brand-violet/10 blur-3xl" />
        <div className="relative px-12 py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success-tint px-3 py-1 text-[10.5px] font-semibold tracking-[0.08em] text-success uppercase">
            <span className="size-1.5 rounded-full bg-success" />
            Platform operations
          </span>
          <h2 className="mt-5 max-w-sm text-[30px] leading-tight font-bold tracking-tight text-ink-900">
            Govern every tenant from one console.
          </h2>
          <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-ink-500">
            Approve organizations, provision warehouses, manage plans and audit
            every platform action.
          </p>
          <ul className="mt-9 max-w-sm space-y-4">
            {[
              { icon: Building2, text: "Tenant provisioning & lifecycle controls" },
              { icon: ShieldCheck, text: "Role-scoped platform administration" },
              { icon: Warehouse, text: "Global feature flags and plan overrides" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/25 bg-brand-tint text-brand-soft">
                  <Icon className="size-4" />
                </span>
                <span className="text-[12.5px] text-ink-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
