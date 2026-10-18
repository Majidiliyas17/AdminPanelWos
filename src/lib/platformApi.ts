// ====================================================================
// platformApi.ts — Platform Console ka API layer (SIRF real API)
// ====================================================================
// Simple language mein: yahan koi mock/fallback nahi hai. Jo bhi request
// fail hoti hai (backend band, 401, 404, 5xx), `toast.api()` se user ko
// screen par dikh jaata hai ki kis module ki call fail hui aur kyun.
// Phir page apna ErrorState/Retry bhi dikha sakta hai.
// ====================================================================

import { adminApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import type {
  ApprovalRequest,
  AuditEvent,
  CreatedPlatformStaff,
  FeatureFlagRow,
  PlatformDashboard,
  PlatformPlan,
  PlatformStaff,
  ProvisionedTenant,
  TenantRow,
  TopTenantRow,
} from "@/lib/platformTypes";

export interface Paged<T> {
  items: T[];
}

// ---- low-level: har call par scope naam se toast ----

async function get<T>(scope: string, url: string, params?: Record<string, unknown>): Promise<T> {
  try {
    const res = await adminApi.get<T>(url, { params });
    return res.data;
  } catch (error) {
    throw toast.api(scope, error);
  }
}

async function post<T>(scope: string, url: string, body?: unknown): Promise<T> {
  try {
    const res = await adminApi.post<T>(url, body);
    return res.data;
  } catch (error) {
    throw toast.api(scope, error);
  }
}

async function put<T>(scope: string, url: string, body?: unknown): Promise<T> {
  try {
    const res = await adminApi.put<T>(url, body);
    return res.data;
  } catch (error) {
    throw toast.api(scope, error);
  }
}

// Backend kabhi array bhejta hai, kabhi single object — dono handle karo
function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  const paged = value as { items?: unknown[] } | null;
  if (paged && Array.isArray(paged.items)) return paged.items as T[];
  return [];
}

const money = (value: number) =>
  value >= 1000 ? `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K` : `$${Math.round(value)}`;

// ---- KPI helpers (real data se compute — kuch bhi hardcoded nahi) ----

export function computeApprovalKpis(requests: ApprovalRequest[]) {
  const pending = requests.filter((r) => r.status === "Pending").length;
  const inReview = requests.filter((r) => r.status === "In Review").length;
  const approved = requests.filter((r) => r.status === "Approved").length;
  const rejected = requests.filter((r) => r.status === "Rejected").length;
  return { pending, inReview, approved, rejected };
}

export function computeTenantKpis(tenants: TenantRow[]) {
  const total = tenants.length;
  const active = tenants.filter((t) => t.status === "Active").length;
  const trial = tenants.filter((t) => t.status === "Trial").length;
  const suspended = tenants.filter((t) => t.status === "Suspended").length;
  return { total, active, trial, suspended };
}

export function computeUserKpis(staff: PlatformStaff[]) {
  const active = staff.filter((s) => s.isActive).length;
  const superAdmins = staff.filter((s) => s.role === "SuperAdmin").length;
  return { total: staff.length, active, inactive: staff.length - active, superAdmins };
}

export function computeFlagKpis(flags: FeatureFlagRow[]) {
  const active = flags.filter((f) => f.isActive).length;
  return { total: flags.length, active, disabled: flags.length - active };
}

export function computeAuditKpis(events: AuditEvent[]) {
  const now = Date.now();
  const last24h = events.filter((e) => now - new Date(e.timestampUtc).getTime() < 86400000).length;
  const uniqueActions = new Set(events.map((e) => e.action)).size;
  return { total: events.length, last24h, uniqueActions };
}

export function computeBillingKpis(plans: PlatformPlan[], tenants: TenantRow[]) {
  const priceById = new Map(plans.map((p) => [p.id, p.monthlyPrice]));
  const paying = tenants.filter((t) => t.status !== "Suspended" && t.planId && priceById.has(t.planId));
  const mrr = paying.reduce((sum, t) => sum + (priceById.get(t.planId as string) ?? 0), 0);
  return {
    mrr,
    payingTenants: paying.length,
    avgRevenue: paying.length ? mrr / paying.length : 0,
  };
}

// ---- API surface ----

async function fetchPlansMap(scope: string): Promise<Map<string, PlatformPlan>> {
  const plans = asArray<PlatformPlan>(await get<PlatformPlan[]>(scope, "/platform/plans"));
  return new Map(plans.map((p) => [p.id, p]));
}

export const platformApi = {
  // Dashboard ka koi alag endpoint nahi hai — teen list se mila kar
  // real numbers banate hain.
  async dashboard(): Promise<PlatformDashboard> {
    const [requestsRaw, tenantsRaw, priceById] = await Promise.all([
      get<ApprovalRequest[]>("Tenant requests", "/platform/tenant-requests"),
      get<TenantRow[]>("Tenants", "/platform/tenants"),
      fetchPlansMap("Plans"),
    ]);

    const requests = asArray<ApprovalRequest>(requestsRaw);
    const tenants = asArray<TenantRow>(tenantsRaw).map((t) => ({
      ...t,
      plan: t.planId ? (priceById.get(t.planId)?.name ?? "—") : "—",
    }));

    const countries = new Set(tenants.map((t) => t.country).filter(Boolean)).size;
    const active = tenants.filter((t) => t.status === "Active").length;
    const pending = requests.filter((r) => r.status === "Pending").length;
    const billing = computeBillingKpis([...priceById.values()], tenants);

    const topTenants: TopTenantRow[] = tenants
      .map((t) => {
        const plan = t.planId ? priceById.get(t.planId) : undefined;
        return {
          tenant: t.name,
          plan: t.plan,
          footprint: t.country || "—",
          mrr: plan ? money(plan.monthlyPrice) : "—",
          status: t.status,
        };
      })
      .slice(0, 5);

    return {
      kpis: {
        totalTenants: tenants.length,
        totalTenantsDelta: countries ? `across ${countries} countries` : "no tenants yet",
        activeTenants: active,
        activeTenantsDelta: tenants.length ? `${Math.round((active / tenants.length) * 100)}% of total` : "—",
        pendingApprovals: pending,
        pendingApprovalsDelta: pending ? "awaiting review" : "queue clear",
        mrr: money(billing.mrr),
        mrrDelta: `${billing.payingTenants} paying tenants`,
      },
      pendingRequests: requests.filter((r) => r.status === "Pending").slice(0, 3),
      topTenants,
    };
  },

  // ---- Approvals ----
  listRequests: async (status?: string): Promise<Paged<ApprovalRequest>> => {
    const scope = "Tenant requests";
    const raw = await get<ApprovalRequest[]>(scope, "/platform/tenant-requests", status ? { status } : undefined);
    return { items: asArray<ApprovalRequest>(raw) };
  },
  getRequest: (id: string) => get<ApprovalRequest>("Tenant request", `/platform/tenant-requests/${id}`),
  approveRequest: (id: string) => post<ProvisionedTenant>("Approve request", `/platform/tenant-requests/${id}/approve`),
  rejectRequest: (id: string, note?: string) =>
    post<void>("Reject request", `/platform/tenant-requests/${id}/reject`, { note: note ?? "" }),

  // ---- Tenants ----
  listTenants: async (): Promise<Paged<TenantRow>> => {
    const scope = "Tenants";
    const [raw, priceById] = await Promise.all([
      get<TenantRow[]>(scope, "/platform/tenants"),
      fetchPlansMap("Plans"),
    ]);
    const items = asArray<TenantRow>(raw).map((t) => ({
      ...t,
      plan: t.planId ? (priceById.get(t.planId)?.name ?? "—") : "—",
    }));
    return { items };
  },
  getTenant: async (id: string): Promise<TenantRow> => {
    const [tenant, priceById] = await Promise.all([
      get<TenantRow>("Tenant", `/platform/tenants/${id}`),
      fetchPlansMap("Plans"),
    ]);
    return { ...tenant, plan: tenant.planId ? (priceById.get(tenant.planId)?.name ?? "—") : "—" };
  },
  suspendTenant: (id: string) => post<void>("Suspend tenant", `/platform/tenants/${id}/suspend`),
  reactivateTenant: (id: string) => post<void>("Reactivate tenant", `/platform/tenants/${id}/reactivate`),
  impersonateTenant: (id: string, referenceTicket: string) =>
    post<{ token: string; email: string; tenantId: string; referenceTicket: string }>(
      "Impersonation",
      `/platform/tenants/${id}/impersonate`,
      { referenceTicket },
    ),

  // ---- Plans ----
  listPlans: async (): Promise<Paged<PlatformPlan>> => {
    const raw = await get<PlatformPlan[]>("Plans", "/platform/plans");
    return { items: asArray<PlatformPlan>(raw) };
  },
  // CreatePlanBody: name/monthlyPrice/maxWarehouses/maxUserSeats
  createPlan: (input: {
    name: string;
    monthlyPrice: number;
    maxWarehouses: number;
    maxUserSeats: number;
  }) => post<{ id: string }>("Create plan", "/platform/plans", input),

  // ---- Feature flags ----
  listFlags: async (): Promise<Paged<FeatureFlagRow>> => {
    const raw = await get<FeatureFlagRow[]>("Feature flags", "/platform/feature-flags");
    return { items: asArray<FeatureFlagRow>(raw) };
  },
  // CreateFeatureFlagBody: sirf key/name/description (isActive create par nahi jaata)
  createFlag: (input: { key: string; name: string; description?: string }) =>
    post<{ id: string }>("Create feature flag", "/platform/feature-flags", {
      key: input.key,
      name: input.name,
      description: input.description ?? "",
    }),
  // UpdateFeatureFlagBody: name + description + isActive teeno chahiye
  toggleFlag: (flag: { id: string; name: string; description: string }, isActive: boolean) =>
    put<void>("Feature flag", `/platform/feature-flags/${flag.id}`, {
      name: flag.name,
      description: flag.description ?? "",
      isActive,
    }),

  // ---- Platform users ----
  listStaff: async (): Promise<Paged<PlatformStaff>> => {
    const raw = await get<PlatformStaff[]>("Platform users", "/platform/users");
    return { items: asArray<PlatformStaff>(raw) };
  },
  // CreatePlatformUserBody: name/email/password/role — response me MFA
  // secret + recovery codes ek hi baar aate hain.
  createStaff: (input: { name: string; email: string; password: string; role: string }) =>
    post<CreatedPlatformStaff>("Add platform user", "/platform/users", input),

  // ---- Audit ----
  listAudit: async (): Promise<Paged<AuditEvent>> => {
    const raw = await get<AuditEvent[]>("Audit log", "/platform/audit-log");
    const events = asArray<AuditEvent>(raw).map((e) => ({
      ...e,
      title: titleFromAction(e.action),
    }));
    return { items: events };
  },
};

// Backend sirf action code bhejta hai ("TenantRequest.Approved") —
// ye human title UI ke liye banata hai.
function titleFromAction(action: string): string {
  const key = action.toLowerCase();
  if (key.includes("approved")) return "Approved tenant request";
  if (key.includes("provision")) return "Provisioned tenant";
  if (key.includes("impersonat")) return "Started impersonation session";
  if (key.includes("rejected")) return "Rejected tenant request";
  if (key.includes("created")) return "Created record";
  if (key.includes("plan")) return "Updated plan";
  if (key.includes("flag")) return "Updated feature flag";
  if (key.includes("suspend")) return "Suspended tenant";
  if (key.includes("login")) return "Signed in";
  return action;
}
