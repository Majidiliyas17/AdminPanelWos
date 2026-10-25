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
  Search,
  Settings,
  ShieldCheck,
  Users,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminAuth } from "@/lib/auth";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";

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

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAdminAuth();
  const role = roleLabel(user?.role);
  return (
    <aside className={cn("flex h-full shrink-0 flex-col bg-sidebar transition-[width] duration-200", collapsed ? "w-[68px]" : "w-[224px]")}>
      <div className={cn("flex items-center gap-2 pt-4 pb-3", collapsed ? "justify-center px-2" : "px-4")}>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-violet text-white"><Warehouse className="size-4" /></span>
        {!collapsed && <span className="min-w-0"><span className="block text-[13px] font-bold text-white">Warehouse<span className="text-brand-violet">OS</span></span><span className="block text-[8px] font-semibold tracking-[0.18em] text-ink-muted">PLATFORM CONSOLE</span></span>}
      </div>

      <div className={cn("mb-3 rounded-lg border border-[#322c58] bg-sidebar-card", collapsed ? "mx-2 p-2 text-center" : "mx-3 px-3 py-2")} title={`${role} · All tenants`}>
        {collapsed ? <ShieldCheck className="mx-auto size-4 text-brand-violet" /> : <><span className="block text-[11px] font-semibold text-white">{role}</span><span className="block text-[9px] text-ink-muted">All tenants · Global</span></>}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2" aria-label="Platform navigation">
        {nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} title={collapsed ? label : undefined} aria-label={label} className={({ isActive }) => cn("flex items-center rounded-lg py-2 text-[12px] font-medium transition-colors", collapsed ? "justify-center px-0" : "gap-3 px-3", isActive ? "bg-sidebar-active text-white [&>svg]:text-brand-violet" : "text-[#c7c5d6] hover:bg-sidebar-active/70 hover:text-white")}><Icon className="size-4 shrink-0" />{!collapsed && <span>{label}</span>}</NavLink>)}
      </nav>

      <div className={cn("mb-2 mt-2 border-t border-[#322c58] pt-3", collapsed ? "mx-2" : "mx-3")}>
        <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "gap-2")}>
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet-tint text-[10px] font-bold text-brand-violet">{initialsOf(user?.name)}</span>
          {!collapsed && <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-white">{user?.name || user?.email || "Signed-in user"}</span><span className="block truncate text-[9px] text-ink-muted">{role}</span></span>}
          <button type="button" onClick={logout} title="Sign out" aria-label="Sign out" className="grid size-7 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-sidebar-active hover:text-white"><LogOut className="size-3.5" /></button>
        </div>
      </div>
      <button type="button" onClick={onToggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="mx-2 mb-3 flex h-8 items-center justify-center gap-2 rounded-lg text-[11px] text-[#c7c5d6] hover:bg-sidebar-active hover:text-white">{collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" />Collapse sidebar</>}</button>
    </aside>
  );
}

export function Topbar({ onToggleSidebar, sidebarCollapsed }: { onToggleSidebar: () => void; sidebarCollapsed: boolean }) {
  const { user, logout } = useAdminAuth();
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
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-4">
      <button type="button" onClick={onToggleSidebar} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-[#f3f4f6]">{sidebarCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}</button>
      <div className="relative w-full max-w-md">
        <form onSubmit={(event) => { event.preventDefault(); submitSearch(); }} className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 focus-within:border-brand-violet">
          <Search className="size-4 shrink-0 text-ink-muted" />
          <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-[12px] text-ink-900 outline-none placeholder:text-ink-muted" placeholder="Search console pages…" aria-label="Search console pages" />
          <kbd className="whitespace-nowrap rounded border border-line bg-[#f9fafb] px-1.5 py-0.5 font-mono text-[9px] text-ink-muted">Ctrl K</kbd>
        </form>
        {query.trim() && <div className="absolute top-11 right-0 left-0 rounded-lg border border-line bg-white p-1 shadow-lg">{matches.length ? matches.slice(0, 5).map((item) => <button type="button" key={item.to} onClick={() => { navigate(item.to); setQuery(""); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] hover:bg-violet-tint"><item.icon className="size-4 text-brand-violet" />{item.label}</button>) : <p className="px-3 py-2 text-[11px] text-ink-500">No console pages match “{query}”.</p>}</div>}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={() => navigate("/approvals")} title={pending.data ? `${pending.data.items.length} pending tenant requests` : "Tenant request approvals"} aria-label={pending.data ? `${pending.data.items.length} pending tenant requests` : "Tenant request approvals"} className="relative grid size-9 place-items-center rounded-lg border border-line bg-white text-ink-500 hover:bg-[#f9fafb]"><Bell className="size-4" />{(pending.data?.items.length ?? 0) > 0 && <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-bold leading-4 text-white">{pending.data!.items.length}</span>}</button>
        <div className="relative">
          <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-label="Open account menu" className="flex items-center gap-2 rounded-lg border border-line bg-white px-2 py-1.5 hover:bg-[#f9fafb]">
            <span className="grid size-7 place-items-center rounded-full bg-violet-tint text-[10px] font-bold text-brand-violet">{initialsOf(user?.name)}</span>
            <span className="hidden text-left sm:block"><span className="block max-w-36 truncate text-[11px] leading-tight font-semibold text-ink-900">{user?.name || user?.email || "Signed-in user"}</span><span className="block text-[9px] leading-tight text-ink-500">{role}</span></span>
            <ChevronDown className="size-3 text-ink-muted" />
          </button>
          {profileOpen && <div className="absolute top-11 right-0 w-56 rounded-lg border border-line bg-white p-2 shadow-lg"><p className="truncate px-2 py-1 text-[11px] font-semibold text-ink-900">{user?.name || "Signed-in user"}</p><p className="truncate px-2 pb-2 text-[10px] text-ink-500">{user?.email || ""}</p><div className="border-t border-line pt-1"><Link to="/settings" onClick={() => setProfileOpen(false)} className="block rounded-md px-2 py-2 text-[11px] hover:bg-[#f9fafb]">Account settings</Link><button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[11px] text-danger hover:bg-danger-tint"><LogOut className="size-3.5" />Sign out</button></div></div>}
        </div>
      </div>
    </header>
  );
}

export function ConsoleFooter() {
  const { pathname } = useLocation();
  const entry = footerMap.find((item) => item.match(pathname));
  return <footer className="flex h-8 shrink-0 items-center justify-between border-t border-line bg-white px-4 text-[10px] text-ink-500"><span className="font-bold text-ink-900">WarehouseOS</span><span>Platform Console · {entry?.label ?? "Console"}</span></footer>;
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === "true");
  const toggleSidebar = () => setCollapsed((value) => { const next = !value; localStorage.setItem(COLLAPSED_KEY, String(next)); return next; });
  return <div className="flex h-full"><Sidebar collapsed={collapsed} onToggle={toggleSidebar} /><div className="flex min-w-0 flex-1 flex-col"><Topbar onToggleSidebar={toggleSidebar} sidebarCollapsed={collapsed} /><main className="flex-1 overflow-y-auto bg-canvas"><Outlet /></main><ConsoleFooter /></div></div>;
}

export function PageHeader({ breadcrumb, title, subtitle, action }: { breadcrumb: string[]; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex items-start justify-between gap-4"><div className="min-w-0"><nav className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500" aria-label="Breadcrumb">{breadcrumb.map((crumb, i) => <span key={`${crumb}-${i}`} className="flex items-center gap-1.5">{i > 0 && <span>·</span>}<span className={i === 0 ? "font-semibold text-ink-900" : undefined}>{crumb}</span></span>)}</nav><h1 className="text-[24px] leading-tight font-bold text-ink-900">{title}</h1>{subtitle && <p className="mt-1 text-[12px] text-ink-500">{subtitle}</p>}</div>{action && <div className="flex shrink-0 items-center gap-2">{action}</div>}</div>;
}

export function Page({ children }: { children: React.ReactNode }) {
  return <div className="p-4 sm:p-6">{children}</div>;
}
