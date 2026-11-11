import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  Flag,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminAuth } from "@/lib/auth";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { useTheme } from "@/lib/theme";

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

const footerMap: Array<{ match: (path: string) => boolean; label: string }> = [
  { match: (p) => p.startsWith("/approvals") && p.includes("/provision"), label: "Approve & Provision Tenant" },
  { match: (p) => p.startsWith("/approvals/"), label: "Request Details" },
  { match: (p) => p === "/approvals", label: "Approval Queue" },
  { match: (p) => p.startsWith("/tenants/"), label: "Tenant Details" },
  { match: (p) => p === "/tenants", label: "Tenant List" },
  { match: (p) => p === "/billing", label: "Billing & Plans" },
  { match: (p) => p === "/feature-flags", label: "Feature Flags" },
  { match: (p) => p === "/users", label: "Platform Users" },
  { match: (p) => p === "/audit-log", label: "Platform Audit Log" },
  { match: (p) => p === "/settings", label: "Console Settings" },
  { match: (p) => p === "/dashboard", label: "Dashboard" },
];

const COLLAPSED_KEY = "wos.admin.sidebar-collapsed";
const roleLabel = (role?: string) => role ? role.replace(/([a-z])([A-Z])/g, "$1 $2") : "Platform User";
const initialsOf = (name?: string) => (name || "?").trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { user, logout } = useAdminAuth();
  const role = roleLabel(user?.role);
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
          role="presentation"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col border-r border-line/70 bg-sidebar transition-[width,transform] duration-200 md:static md:z-auto md:translate-x-0",
          collapsed ? "md:w-[72px]" : "md:w-[228px]",
          "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className={cn("flex items-center gap-2 pt-4 pb-3", collapsed ? "md:justify-center md:px-2 px-4" : "px-4")}>
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-brand-violet text-white shadow-[0_10px_24px_-12px_rgb(124_108_255/35%)]">
            <Warehouse className="size-4" />
          </span>
          <span className={cn("min-w-0", collapsed && "md:hidden")}>
            <span className="block text-[13.5px] font-bold tracking-tight text-ink-900">
              Warehouse<span className="text-brand-violet">OS</span>
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.18em] text-ink-muted">
              PLATFORM CONSOLE
            </span>
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="ml-auto grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-sidebar-active hover:text-ink-900 md:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          className={cn(
            "mb-3 rounded-lg border border-line/70 bg-sidebar-card",
            collapsed ? "md:mx-2 md:p-2 md:text-center mx-3 px-3 py-2" : "mx-3 px-3 py-2",
          )}
          title={`${role} · All tenants`}
        >
          {collapsed ? (
            <>
              <ShieldCheck className="mx-auto hidden size-4 text-brand-violet md:block" />
              <span className="block text-[12px] font-semibold text-ink-900 md:hidden">{role}</span>
            </>
          ) : (
            <>
              <span className="block text-[12px] font-semibold text-ink-900">{role}</span>
              <span className="block text-[10.5px] text-ink-muted">All tenants · Global</span>
            </>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2" aria-label="Platform navigation">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              title={collapsed ? label : undefined}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center rounded-lg py-2 text-[12.5px] font-medium transition-colors",
                  collapsed ? "md:justify-center md:px-0 gap-3 px-3" : "gap-3 px-3",
                  isActive
                    ? "bg-sidebar-active text-ink-900 before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r-full before:bg-success before:shadow-[0_0_10px_rgb(192_217_37/45%)] before:content-[''] [&>svg]:text-success"
                    : "text-ink-500 hover:bg-sidebar-active/70 hover:text-ink-900",
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              <span className={cn(collapsed && "md:hidden")}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={cn("mt-2 mb-2 border-t border-line/70 pt-3", collapsed ? "md:mx-2 mx-3" : "mx-3")}>
          <div className={cn("flex items-center gap-2", collapsed && "md:flex-col md:gap-2")}>
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet-tint text-[11px] font-bold text-brand-violet">
              {initialsOf(user?.name)}
            </span>
            <span className={cn("min-w-0 flex-1", collapsed && "md:hidden")}>
              <span className="block truncate text-[11.5px] font-semibold text-ink-900">
                {user?.name || user?.email || "Signed-in user"}
              </span>
              <span className="block truncate text-[10.5px] text-ink-muted">{role}</span>
            </span>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="grid size-7 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-sidebar-active hover:text-ink-900"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="mx-2 mb-3 hidden h-8 items-center justify-center gap-2 rounded-lg text-[12px] text-ink-500 hover:bg-sidebar-active hover:text-ink-900 md:flex"
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" />Collapse sidebar</>}
        </button>
      </aside>
    </>
  );
}

export function Topbar({
  onToggleSidebar,
  sidebarCollapsed,
  onOpenMobile,
}: {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onOpenMobile: () => void;
}) {
  const { user, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pending = useAsync(() => platformApi.listRequests("Pending"), []);
  const role = roleLabel(user?.role);
  const matches = query.trim() ? nav.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())) : [];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === "Escape") { setQuery(""); setProfileOpen(false); searchRef.current?.blur(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function submitSearch() {
    const match = matches[0];
    if (match) { navigate(match.to); setQuery(""); }
  }

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line/80 bg-surface/90 px-4 backdrop-blur-xl">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Open navigation"
        className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-ink-500 hover:bg-surface-3 hover:text-ink-900 md:hidden"
      >
        <Menu className="size-4" />
      </button>
      <button
        type="button"
        onClick={onToggleSidebar}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-ink-500 hover:bg-surface-3 hover:text-ink-900 md:grid"
      >
        {sidebarCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
      </button>
      <div className="relative w-full max-w-md">
        <form
          onSubmit={(event) => { event.preventDefault(); submitSearch(); }}
          className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 focus-within:border-primary"
        >
          <Search className="size-4 shrink-0 text-ink-muted" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-[13px] text-ink-900 outline-none placeholder:text-ink-muted"
            placeholder="Search console pages…"
            aria-label="Search console pages"
          />
          <kbd className="hidden whitespace-nowrap rounded border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[11px] text-ink-muted sm:block">
            Ctrl K
          </kbd>
        </form>
        {query.trim() && (
          <div className="absolute top-12 right-0 left-0 overflow-hidden rounded-xl border border-line-strong bg-surface p-1 wos-shadow-overlay">
            {matches.length ? (
              matches.slice(0, 5).map((item) => (
                <button
                  type="button"
                  key={item.to}
                  onClick={() => { navigate(item.to); setQuery(""); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] text-ink-700 hover:bg-brand-tint hover:text-ink-900"
                >
                  <item.icon className="size-4 text-brand-violet" />
                  {item.label}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-[11.5px] text-ink-500">No console pages match “{query}”.</p>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`} className="grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-ink-500 hover:bg-surface-3 hover:text-ink-900">{theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}</button>
        <button
          type="button"
          onClick={() => navigate("/approvals")}
          title={pending.data ? `${pending.data.items.length} pending tenant requests` : "Tenant request approvals"}
          aria-label={pending.data ? `${pending.data.items.length} pending tenant requests` : "Tenant request approvals"}
          className="relative grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-ink-500 hover:bg-surface-3 hover:text-ink-900"
        >
          <Bell className="size-4" />
          {(pending.data?.items.length ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full border border-canvas bg-danger px-1 text-[10px] font-bold leading-4 text-[#2a0a11]">
              {pending.data!.items.length}
            </span>
          )}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-label="Open account menu"
            className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-2 py-1.5 hover:bg-surface-3"
          >
            <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-primary to-brand-violet text-[11px] font-bold text-white">
              {initialsOf(user?.name)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-36 truncate text-[11.5px] leading-tight font-semibold text-ink-900">
                {user?.name || user?.email || "Signed-in user"}
              </span>
              <span className="block text-[10.5px] leading-tight text-ink-500">{role}</span>
            </span>
            <ChevronDown className="size-3 text-ink-muted" />
          </button>
          {profileOpen && (
            <div className="absolute top-12 right-0 w-60 overflow-hidden rounded-xl border border-line-strong bg-surface p-2 wos-shadow-overlay">
              <p className="truncate px-2 py-1 text-[11.5px] font-semibold text-ink-900">{user?.name || "Signed-in user"}</p>
              <p className="truncate px-2 pb-2 text-[11.5px] text-ink-500">{user?.email || ""}</p>
              <div className="border-t border-line pt-1">
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="block rounded-md px-2 py-2 text-[11.5px] text-ink-700 hover:bg-surface-3 hover:text-ink-900"
                >
                  Account settings
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[11.5px] text-danger hover:bg-danger-tint"
                >
                  <LogOut className="size-3.5" />Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function ConsoleFooter() {
  const { pathname } = useLocation();
  const entry = footerMap.find((item) => item.match(pathname));
  return (
    <footer className="flex h-9 shrink-0 items-center justify-between gap-3 border-t border-line/80 bg-surface/80 px-4 text-[11.5px] text-ink-500">
      <span className="font-bold text-ink-900">WarehouseOS</span>
      <span className="truncate">Platform Console · {entry?.label ?? "Console"}</span>
    </footer>
  );
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) !== "false");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const toggleSidebar = () => setCollapsed((value) => { const next = !value; localStorage.setItem(COLLAPSED_KEY, String(next)); return next; });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="flex h-full">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={collapsed}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div key={pathname} className="animate-fade-up">
            <Outlet />
          </div>
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
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <nav className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-muted" aria-label="Breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <span key={`${crumb}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-ink-muted/60">/</span>}
              <span className={i === 0 ? "font-semibold text-ink-500" : i === breadcrumb.length - 1 ? "text-ink-700" : undefined}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
        <h1 className="text-[25px] leading-tight font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-[12.5px] text-ink-500">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-7">{children}</div>;
}
