import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
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
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="relative grid min-h-full min-w-0 grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <div className="absolute top-5 right-5 z-10"><ThemeToggle /></div>
      <div className="grid min-w-0 place-items-center px-4 py-10 sm:px-10">
        <div className="warehouse-scene warehouse-route-scene warehouse-route-scene--compact mb-6 w-full max-w-[340px] lg:hidden" aria-hidden="true">
          <div className="warehouse-road"><i /></div>
          <span className="warehouse-truck"><img src="/images/warehouse-truck-v1.png" alt="" draggable="false" /></span>
          <div className="warehouse-scene__status"><span className="size-2 rounded-full bg-primary" /> Platform route</div>
        </div>
        <form onSubmit={onSubmit} className="w-full min-w-0 max-w-[340px]">
          <div className="mb-6 flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-brand-violet text-white shadow-[0_12px_28px_-12px_rgb(124_108_255/35%)]">
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
          className="group mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[13.5px] font-semibold text-white shadow-[0_14px_30px_-12px_rgb(105_85_232/48%)] hover:bg-primary-dark disabled:opacity-50"
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

      <aside className="auth-visual-panel relative hidden overflow-hidden border-l border-line bg-gradient-to-br from-[#f4f5f8] via-white to-[#f6f4ff] lg:flex lg:flex-col lg:justify-center">
        <div className="absolute inset-0 warehouse-horizon" />
        <div className="relative mx-auto w-full max-w-[650px] px-10 py-14 xl:px-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-surface/80 px-3 py-1 text-[10.5px] font-semibold tracking-[0.08em] text-success uppercase shadow-sm"><span className="size-1.5 rounded-full bg-success status-dot-live"/> Platform operations</span>
          <h2 className="mt-5 max-w-lg text-[32px] leading-tight font-bold tracking-tight text-ink-900">A clear view across every warehouse.</h2>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-ink-500">Manage tenants, approvals and plans from one calm command center.</p>
          <div className="warehouse-scene warehouse-route-scene mt-7">
            <div className="warehouse-road"><i/></div><span className="warehouse-truck"><img src="/images/warehouse-truck-v1.png" alt="" draggable="false"/></span>
            <div className="warehouse-scene__status"><span className="size-2 rounded-full bg-brand"/> Platform route preview</div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface/85 px-4 py-3 shadow-[0_12px_35px_-28px_rgba(33,42,78,.35)]">
            {["Review", "Provision", "Manage"].map((step, index) => (
              <div key={step} className="flex min-w-0 items-center gap-2 text-[11.5px] font-semibold text-ink-700">
                <span className={`grid size-6 shrink-0 place-items-center rounded-full ${index === 1 ? "bg-primary text-white" : "bg-primary-tint text-primary"}`}>{index + 1}</span>
                {step}
                {index < 2 && <span className="ml-1 h-px w-6 shrink-0 bg-line-strong sm:w-10" />}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 text-[11.5px] text-ink-500"><ShieldCheck className="size-4 text-success"/> Secure, auditable platform administration</div>
        </div>
      </aside>
    </div>
  );
}
