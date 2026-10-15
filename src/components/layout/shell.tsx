import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  CreditCard,
  Flag,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  Warehouse,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminAuth } from "@/lib/auth";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tenants", label: "Tenants", icon: Warehouse },
  { to: "/approvals", label: "Approvals", icon: BadgeCheck },
  { to: "/billing", label: "Billing & Plans", icon: CreditCard },
  { to: "/feature-flags", label: "Feature Flags", icon: Flag },
  { to: "/users", label: "Platform Users", icon: Users },
  { to: "/audit-log", label: "Audit Log", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
];

const footerMap: Array<{ match: (path: string) => boolean; label: string; page: number }> = [
  { match: (p) => p === "/dashboard", label: "Dashboard", page: 144 },
  { match: (p) => p.startsWith("/approvals") && p.includes("/provision"), label: "Approve & Provision Tenant", page: 147 },
  { match: (p) => p.startsWith("/approvals/"), label: "Request Details", page: 146 },
  { match: (p) => p === "/approvals", label: "Approval Queue", page: 145 },
  { match: (p) => p.startsWith("/tenants/"), label: "Tenant Details", page: 149 },
  { match: (p) => p === "/tenants", label: "Tenant List", page: 148 },
  { match: (p) => p === "/billing", label: "Billing & Plans", page: 151 },
  { match: (p) => p === "/feature-flags", label: "Feature Flags", page: 152 },
  { match: (p) => p === "/users", label: "Platform Users & Roles", page: 153 },
  { match: (p) => p === "/audit-log", label: "Platform Audit Log", page: 154 },
  { match: (p) => p === "/settings", label: "Console Settings", page: 155 },
];

export function Sidebar() {
  const { user, logout } = useAdminAuth();
  const initials = (user?.name || "Riya Kapoor")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="flex w-[176px] shrink-0 flex-col bg-sidebar">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <span className="grid size-7 place-items-center rounded-lg bg-brand-violet text-white">
          <Warehouse className="size-4" />
        </span>
        <span>
          <span className="block text-[13px] font-bold text-white">
            Warehouse<span className="text-brand-violet">OS</span>
          </span>
          <span className="block text-[8px] font-semibold tracking-[0.18em] text-ink-muted">PLATFORM CONSOLE</span>
        </span>
      </div>

      <button className="mx-3 mb-3 flex items-center justify-between rounded-lg border border-[#322c58] bg-sidebar-card px-3 py-2 text-left">
        <span>
          <span className="block text-[11px] font-semibold text-white">Super Admin</span>
          <span className="block text-[9px] text-ink-muted">All Tenants · Global</span>
        </span>
        <ChevronDown className="size-3.5 text-ink-muted" />
      </button>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[12px] font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active text-white [&>svg]:text-brand-violet"
                  : "text-[#c7c5d6] hover:bg-sidebar-active/70 hover:text-white",
              )
            }
          >
            <Icon className="size-3.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-3 mb-3 mt-2 border-t border-[#322c58] pt-3">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-violet-tint text-[10px] font-bold text-brand-violet">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-semibold text-white">{user?.name || "Riya Kapoor"}</span>
            <span className="block text-[9px] text-ink-muted">Super Admin</span>
          </span>
          <button
            onClick={logout}
            title="Sign out"
            className="grid size-6 place-items-center rounded-md text-ink-muted hover:bg-sidebar-active hover:text-white"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function Topbar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-white px-4">
      <label className="flex h-[30px] w-[255px] items-center gap-2 rounded-lg border border-line bg-white px-2.5">
        <ShieldCheck className="size-3.5 text-ink-muted" />
        <input
          className="w-full bg-transparent text-[11px] text-ink-900 outline-none placeholder:text-ink-muted"
          placeholder="Search tenants, requests, invoices…"
        />
        <kbd className="rounded border border-line bg-[#f9fafb] px-1 py-0.5 font-mono text-[9px] text-ink-muted">ctrl K</kbd>
      </label>

      <div className="ml-auto flex items-center gap-2">
        {["🌐", "📅", "🔔", "?"].map((glyph, i) => (
          <button
            key={i}
            className="relative grid size-7 place-items-center rounded-lg border border-line bg-white text-[12px] text-ink-500 hover:bg-[#f9fafb]"
          >
            {glyph}
            {i === 2 && <span className="absolute top-1 right-1 size-1.5 rounded-full bg-danger" />}
          </button>
        ))}
        <button className="flex items-center gap-2 rounded-lg border border-line bg-white px-2 py-1">
          <span className="grid size-6 place-items-center rounded-full bg-violet-tint text-[10px] font-bold text-brand-violet">RK</span>
          <span className="text-left">
            <span className="block text-[12px] leading-tight font-semibold text-ink-900">Riya Kapoor</span>
            <span className="block text-[9px] leading-tight text-ink-500">Super Admin</span>
          </span>
          <ChevronDown className="size-3 text-ink-muted" />
        </button>
      </div>
    </header>
  );
}

export function ConsoleFooter() {
  const { pathname } = useLocation();
  const entry = footerMap.find((item) => item.match(pathname));
  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-line bg-white px-4 text-[10px] text-ink-500">
      <span className="font-bold text-ink-900">WarehouseOS</span>
      <span>Platform Console · {entry?.label ?? "Console"}</span>
      <span>Page {entry?.page ?? "—"} / 158</span>
    </footer>
  );
}

export function AppShell() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-canvas">
          <Outlet />
        </main>
        <ConsoleFooter />
      </div>
    </div>
  );
}

export function PageHeader({
  breadcrumb,
  title,
  subtitle,
  action,
}: {
  breadcrumb: string[];
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <nav className="mb-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-1.5">
              {i > 0 && <span>·</span>}
              <span className={i === 0 ? "font-semibold text-ink-900" : undefined}>{crumb}</span>
            </span>
          ))}
        </nav>
        <h1 className="text-[24px] leading-tight font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[12px] text-ink-500">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
}
