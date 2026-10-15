import { adminApi, adminAuthStore, isNetworkError } from "@/lib/api";
import type {
  ApprovalRequest,
  AuditEvent,
  FeatureFlagRow,
  ImpersonationSession,
  PlatformPlan,
  PlatformStaff,
  ProvisionedTenant,
  TenantRow,
} from "@/lib/platformTypes";
import {
  approvalKpis,
  automatedChecks,
  auditKpis,
  billingInvoiceRows,
  billingKpis,
  createMockProvisionedTenant,
  dashboardKpis,
  flagKpis,
  mockAudit,
  mockFlags,
  mockOverrides,
  mockPlans,
  mockRequests,
  mockStaff,
  mockTenants,
  pushMockAudit,
  tenantKpis,
  topTenantsByMrr,
  upsertMockFlag,
  upsertMockPlan,
  upsertMockStaff,
  updateMockTenantStatus,
  userKpis,
} from "@/mocks/platform";

export interface Paged<T> {
  items: T[];
  source: "api" | "mock";
}

async function withFallback<T>(
  load: () => Promise<T[]>,
  fallback: () => T[],
): Promise<Paged<T>> {
  if (adminAuthStore.mockMode) return { items: fallback(), source: "mock" };
  try {
    const data = await load();
    return { items: data, source: "api" };
  } catch (error) {
    if (isNetworkError(error)) return { items: fallback(), source: "mock" };
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404 || status === 501) return { items: fallback(), source: "mock" };
    throw error;
  }
}

export const platformApi = {
  async dashboard() {
    if (adminAuthStore.mockMode) {
      return {
        kpis: dashboardKpis,
        pendingRequests: mockRequests.filter((r) => r.status === "Pending").slice(0, 3),
        topTenants: topTenantsByMrr,
        source: "mock" as const,
      };
    }
    try {
      const [requestsRes, tenantsRes] = await Promise.all([
        adminApi.get<ApprovalRequest[]>("/platform/tenant-requests"),
        adminApi.get<TenantRow[]>("/platform/tenants"),
      ]);
      const requests = requestsRes.data;
      const tenants = tenantsRes.data;
      const active = tenants.filter((t) => t.status === "Active").length;
      const pending = requests.filter((r) => r.status === "Pending").length;
      const mrrSum = tenants
        .filter((t) => t.status !== "Suspended")
        .reduce((sum, t) => sum + (t.mrr || 0), 0);
      return {
        kpis: {
          ...dashboardKpis,
          totalTenants: tenants.length || dashboardKpis.totalTenants,
          activeTenants: active || dashboardKpis.activeTenants,
          pendingApprovals: pending || dashboardKpis.pendingApprovals,
          mrr: mrrSum ? `$${Math.round(mrrSum / 1000)}K` : dashboardKpis.mrr,
        },
        pendingRequests: requests.filter((r) => r.status === "Pending").slice(0, 3),
        topTenants: topTenantsByMrr,
        source: "api" as const,
      };
    } catch (error) {
      if (isNetworkError(error)) {
        return {
          kpis: dashboardKpis,
          pendingRequests: mockRequests.filter((r) => r.status === "Pending").slice(0, 3),
          topTenants: topTenantsByMrr,
          source: "mock" as const,
        };
      }
      throw error;
    }
  },

  approvalKpis,

  async listRequests(status?: string): Promise<Paged<ApprovalRequest>> {
    const normalized = !status || status === "All" ? undefined : status;
    return withFallback(
      async () => {
        const res = await adminApi.get<ApprovalRequest[]>("/platform/tenant-requests", {
          params: normalized ? { status: normalized } : undefined,
        });
        return res.data;
      },
      () => {
        const rows = normalized ? mockRequests.filter((r) => r.status === normalized) : mockRequests;
        return rows;
      },
    );
  },

  async getRequest(id: string): Promise<ApprovalRequest> {
    if (adminAuthStore.mockMode) {
      const found = mockRequests.find((r) => r.id === id);
      if (!found) throw new Error("Request not found");
      return found;
    }
    try {
      const res = await adminApi.get<ApprovalRequest>(`/platform/tenant-requests/${id}`);
      return res.data;
    } catch (error) {
      if (isNetworkError(error) || (error as { response?: { status?: number } })?.response?.status === 404) {
        const found = mockRequests.find((r) => r.id === id);
        if (found) return found;
      }
      throw error;
    }
  },

  automatedChecks,

  async approveRequest(id: string): Promise<ProvisionedTenant> {
    if (adminAuthStore.mockMode) {
      const request = mockRequests.find((r) => r.id === id);
      if (!request) throw new Error("Request not found");
      const provisioned = createMockProvisionedTenant(request, request.requestedPlan, "USD", 0, 25);
      request.status = "Approved";
      pushMockAudit({
        title: "Tenant Approved",
        detail: `${request.companyName} → ${provisioned.tenantCode} · by Riya Kapoor`,
        action: "TenantRequestApproved",
      });
      return provisioned;
    }
    const res = await adminApi.post<ProvisionedTenant>(`/platform/tenant-requests/${id}/approve`);
    return res.data;
  },

  async rejectRequest(id: string, note?: string) {
    if (adminAuthStore.mockMode) {
      const request = mockRequests.find((r) => r.id === id);
      if (request) {
        request.status = "Rejected";
        pushMockAudit({
          title: "Tenant Rejected",
          detail: `${request.companyName}${note ? ` — ${note}` : ""} · by Riya Kapoor`,
          action: "TenantRequestRejected",
        });
      }
      return;
    }
    await adminApi.post(`/platform/tenant-requests/${id}/reject`, { note: note || null });
  },

  tenantKpis,

  async listTenants(): Promise<Paged<TenantRow>> {
    return withFallback(
      async () => {
        const res = await adminApi.get<TenantRow[]>("/platform/tenants");
        return res.data;
      },
      () => mockTenants,
    );
  },

  async getTenant(id: string): Promise<TenantRow> {
    if (adminAuthStore.mockMode) {
      const found = mockTenants.find((t) => t.id === id || t.code === id);
      if (!found) throw new Error("Tenant not found");
      return found;
    }
    try {
      const res = await adminApi.get<TenantRow>(`/platform/tenants/${id}`);
      const data = res.data;
      const mock = mockTenants.find((t) => t.id === data.id || t.code === data.code);
      return {
        ...data,
        mrr: data.mrr ?? mock?.mrr ?? 0,
        healthScore: data.healthScore ?? mock?.healthScore ?? 0,
        activeUsers: data.activeUsers ?? mock?.activeUsers ?? 0,
        userSeats: data.userSeats ?? mock?.userSeats ?? 0,
        regionCount: data.regionCount ?? mock?.regionCount ?? 0,
        memberSince: data.memberSince ?? mock?.memberSince ?? data.since,
        platformInvoices: data.platformInvoices?.length ? data.platformInvoices : mock?.platformInvoices ?? [],
        usage: data.usage?.length ? data.usage : mock?.usage ?? [],
      };
    } catch (error) {
      if (isNetworkError(error) || (error as { response?: { status?: number } })?.response?.status === 404) {
        const found = mockTenants.find((t) => t.id === id || t.code === id);
        if (found) return found;
      }
      throw error;
    }
  },

  async suspendTenant(id: string) {
    if (adminAuthStore.mockMode) {
      updateMockTenantStatus(id, "Suspended");
      const tenant = mockTenants.find((t) => t.id === id);
      pushMockAudit({
        title: "Tenant Suspended",
        detail: `${tenant?.name ?? id} · by Riya Kapoor`,
        action: "TenantSuspended",
      });
      return;
    }
    await adminApi.post(`/platform/tenants/${id}/suspend`);
  },

  async reactivateTenant(id: string) {
    if (adminAuthStore.mockMode) {
      updateMockTenantStatus(id, "Active");
      const tenant = mockTenants.find((t) => t.id === id);
      pushMockAudit({
        title: "Tenant Reactivated",
        detail: `${tenant?.name ?? id} · by Riya Kapoor`,
        action: "TenantReactivated",
      });
      return;
    }
    await adminApi.post(`/platform/tenants/${id}/reactivate`);
  },

  async impersonateTenant(id: string, referenceTicket: string): Promise<ImpersonationSession> {
    if (adminAuthStore.mockMode) {
      const tenant = mockTenants.find((t) => t.id === id);
      pushMockAudit({
        title: "Impersonated Tenant",
        detail: `${tenant?.name ?? id} — ${referenceTicket} · by Riya Kapoor`,
        action: "TenantImpersonated",
      });
      return {
        userId: "mock-user",
        email: `owner@${tenant?.code ?? "tenant"}.example`,
        tenantId: id,
        token: "mock-impersonation-token",
        referenceTicket,
      };
    }
    const res = await adminApi.post<ImpersonationSession>(`/platform/tenants/${id}/impersonate`, {
      referenceTicket,
    });
    return res.data;
  },

  billingKpis,

  async listPlans(): Promise<Paged<PlatformPlan>> {
    return withFallback(
      async () => {
        const res = await adminApi.get<
          { id: string; name: string; monthlyPrice: number; maxWarehouses: number; maxUserSeats: number; isActive: boolean }[]
        >("/platform/plans");
        return res.data.map((p) => ({
          id: p.id,
          name: p.name,
          monthlyPrice: p.monthlyPrice,
          maxWarehouses: p.maxWarehouses,
          maxUserSeats: p.maxUserSeats,
          warehousesLabel:
            p.maxWarehouses >= 9999 ? "Unlimited warehouses" : `Up to ${p.maxWarehouses} warehouse${p.maxWarehouses === 1 ? "" : "s"}`,
          seatsLabel: p.maxUserSeats >= 99999 ? "Unlimited seats" : `${p.maxUserSeats} user seats`,
          priceLabel: p.monthlyPrice >= 9999 ? "Custom" : `$${p.monthlyPrice.toLocaleString("en-US")}`,
          highlighted: p.name.toLowerCase() === "growth",
          active: p.isActive,
        }));
      },
      () => mockPlans,
    );
  },

  async createPlan(input: { name: string; monthlyPrice: number; maxWarehouses: number; maxUserSeats: number }) {
    if (adminAuthStore.mockMode) {
      const plan: PlatformPlan = {
        id: `plan-${Date.now()}`,
        name: input.name,
        monthlyPrice: input.monthlyPrice,
        maxWarehouses: input.maxWarehouses,
        maxUserSeats: input.maxUserSeats,
        warehousesLabel: `Up to ${input.maxWarehouses} warehouses`,
        seatsLabel: `${input.maxUserSeats} user seats`,
        priceLabel: `$${input.monthlyPrice.toLocaleString("en-US")}`,
        highlighted: false,
        active: true,
      };
      upsertMockPlan(plan);
      pushMockAudit({ title: "Plan Created", detail: `${input.name} · by Riya Kapoor`, action: "PlanCreated" });
      return plan;
    }
    const res = await adminApi.post<{ id: string }>("/platform/plans", input);
    return { id: res.data.id, ...input } as PlatformPlan;
  },

  async billingInvoices(): Promise<Paged<(typeof billingInvoiceRows)[number]>> {
    return withFallback(async () => billingInvoiceRows, () => billingInvoiceRows);
  },

  flagKpis,

  async listFlags(): Promise<Paged<FeatureFlagRow>> {
    return withFallback(
      async () => {
        const res = await adminApi.get<
          { id: string; key: string; name: string; description: string; isActive: boolean }[]
        >("/platform/feature-flags");
        return res.data.map((f) => {
          const mock = mockFlags.find((m) => m.key === f.key || m.id === f.id);
          return {
            id: f.id,
            key: f.key,
            name: f.name,
            description: f.description,
            starter: mock?.starter ?? false,
            growth: mock?.growth ?? f.isActive,
            enterprise: mock?.enterprise ?? f.isActive,
            active: f.isActive,
          };
        });
      },
      () => mockFlags,
    );
  },

  async createFlag(input: { key: string; name: string; description: string }) {
    if (adminAuthStore.mockMode) {
      const flag: FeatureFlagRow = {
        id: `flag-${Date.now()}`,
        key: input.key,
        name: input.name,
        description: input.description,
        starter: false,
        growth: false,
        enterprise: true,
        active: true,
      };
      upsertMockFlag(flag);
      pushMockAudit({ title: "Feature Flag Created", detail: `${input.name} · by Riya Kapoor`, action: "FeatureFlagCreated" });
      return flag;
    }
    const res = await adminApi.post<{ id: string }>("/platform/feature-flags", input);
    return {
      id: res.data.id,
      key: input.key,
      name: input.name,
      description: input.description,
      starter: false,
      growth: false,
      enterprise: true,
      active: true,
    } satisfies FeatureFlagRow;
  },

  async toggleFlag(flag: FeatureFlagRow, plan: "starter" | "growth" | "enterprise", enabled: boolean) {
    if (adminAuthStore.mockMode) {
      const found = mockFlags.find((f) => f.id === flag.id);
      if (found) found[plan] = enabled;
      pushMockAudit({
        title: "Feature Flag Changed",
        detail: `${flag.name} ${plan} → ${enabled ? "on" : "off"} · by Riya Kapoor`,
        action: "FeatureFlagUpdated",
      });
      return;
    }
    const isActive = plan === "enterprise" ? enabled || flag.growth || flag.starter : flag.enterprise || flag.growth || flag.starter;
    await adminApi.put(`/platform/feature-flags/${flag.id}`, {
      name: flag.name,
      description: flag.description,
      isActive,
    });
  },

  overrides: mockOverrides,

  userKpis,

  async listStaff(): Promise<Paged<PlatformStaff>> {
    return withFallback(
      async () => {
        const res = await adminApi.get<{ id: string; name: string; email: string; role: string; isActive: boolean }[]>(
          "/platform/users",
        );
        return res.data.map((u) => ({
          id: u.id,
          name: u.name,
          role: u.role,
          email: u.email,
          status: u.isActive ? "Active" : "Inactive",
          lastLogin: "—",
        }));
      },
      () => mockStaff,
    );
  },

  async createStaff(input: { name: string; email: string; password: string; role: string }) {
    if (adminAuthStore.mockMode) {
      const staff: PlatformStaff = {
        id: `staff-${Date.now()}`,
        name: input.name,
        role: input.role,
        email: input.email,
        status: "Active",
        lastLogin: "—",
      };
      upsertMockStaff(staff);
      pushMockAudit({ title: "Platform User Created", detail: `${input.email} (${input.role}) · by Riya Kapoor`, action: "PlatformUserCreated" });
      return { staff, mfaSecret: "MOCKSECRET", recoveryCodes: ["11111-22222", "33333-44444"] };
    }
    const res = await adminApi.post<{ id: string; email: string; role: string; mfaSecret: string; recoveryCodes: string[] }>(
      "/platform/users",
      input,
    );
    return {
      staff: {
        id: res.data.id,
        name: input.name,
        email: res.data.email,
        role: res.data.role,
        status: "Active",
        lastLogin: "—",
      } satisfies PlatformStaff,
      mfaSecret: res.data.mfaSecret,
      recoveryCodes: res.data.recoveryCodes,
    };
  },

  auditKpis,

  async listAudit(): Promise<Paged<AuditEvent>> {
    return withFallback(
      async () => {
        const res = await adminApi.get<{
          id: string;
          action: string;
          detail: string;
          timestampUtc: string;
        }[]>("/platform/audit-log");
        return res.data.map((row) => ({
          id: row.id,
          title: titleFromAction(row.action),
          detail: row.detail,
          timestampUtc: row.timestampUtc,
          action: row.action,
        }));
      },
      () => mockAudit,
    );
  },
};

function titleFromAction(action: string): string {
  const map: Record<string, string> = {
    TenantRequestApproved: "Tenant Approved",
    TenantRequestRejected: "Tenant Rejected",
    TenantProvisioned: "Tenant Provisioned",
    TenantSuspended: "Tenant Suspended",
    TenantReactivated: "Tenant Reactivated",
    TenantImpersonated: "Impersonated Tenant",
    PlanChanged: "Plan Changed",
    PlanCreated: "Plan Created",
    FeatureFlagCreated: "Feature Flag Created",
    FeatureFlagUpdated: "Feature Flag Changed",
    TenantFeatureFlagUpdated: "Feature Flag Changed",
    PlatformUserCreated: "Platform User Created",
    PlatformMfaReset: "MFA Reset",
  };
  return map[action] ?? action;
}
