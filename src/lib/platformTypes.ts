export interface ApprovalRequest {
  id: string;
  companyName: string;
  country: string;
  warehouseType: string;
  contactName: string;
  email: string;
  requestedPlan: string;
  status: string;
  submittedAtUtc: string;
  reviewedAtUtc?: string | null;
  reviewNote?: string | null;
}

export interface TenantRow {
  id: string;
  name: string;
  code: string;
  planId?: string | null;
  plan: string;
  status: string;
  country: string;
  currency: string;
  warehouses?: number;
  since?: string;
  mrr?: number;
  healthScore?: number;
  activeUsers?: number;
  userSeats?: number;
  memberSince?: string;
}

export interface PlatformPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  maxWarehouses: number;
  maxUserSeats: number;
  isActive: boolean;
}

export interface FeatureFlagRow {
  id: string;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface PlatformStaff {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface CreatedPlatformStaff {
  id: string;
  email: string;
  role: string;
  mfaSecret: string;
  authenticatorUri: string;
  recoveryCodes: string[];
}

export interface AuditEvent {
  id: string;
  action: string;
  title: string;
  detail: string;
  timestampUtc: string;
}

export interface ProvisionedTenant {
  tenantId: string;
  tenantCode: string;
  inviteUrl?: string;
  inviteEmailSent: boolean;
}

export interface PlatformDashboard {
  kpis: {
    totalTenants: number;
    totalTenantsDelta: string;
    activeTenants: number;
    activeTenantsDelta: string;
    pendingApprovals: number;
    pendingApprovalsDelta: string;
    mrr: string;
    mrrDelta: string;
  };
  pendingRequests: ApprovalRequest[];
  topTenants: TopTenantRow[];
}

export interface TopTenantRow {
  tenant: string;
  plan: string;
  footprint: string;
  mrr: string;
  status: string;
}

export type TenantUsageMetric = never;
