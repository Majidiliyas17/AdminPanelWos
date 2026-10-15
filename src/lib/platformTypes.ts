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
  estimatedWarehouses?: number;
  estimatedMrr?: string;
  region?: string;
  checks?: number;
}

export interface TenantRow {
  id: string;
  name: string;
  code: string;
  plan: string;
  warehouses: number;
  since: string;
  status: string;
  country: string;
  currency: string;
  mrr: number;
  healthScore: number;
  activeUsers: number;
  userSeats: number;
  regionCount: number;
  memberSince: string;
  platformInvoices: { invoice: string; period: string; amount: string; status: string }[];
  usage: TenantUsageMetric[];
}

export interface TenantUsageMetric {
  metric: string;
  current: string;
  limit: string;
}

export interface PlatformPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  maxWarehouses: number;
  maxUserSeats: number;
  warehousesLabel: string;
  seatsLabel: string;
  priceLabel: string;
  highlighted: boolean;
  active: boolean;
}

export interface FeatureFlagRow {
  id: string;
  key: string;
  name: string;
  description: string;
  starter: boolean;
  growth: boolean;
  enterprise: boolean;
  active: boolean;
}

export interface TenantOverride {
  tenant: string;
  feature: string;
  override: string;
  setBy: string;
}

export interface PlatformStaff {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  lastLogin: string;
}

export interface AuditEvent {
  id: string;
  title: string;
  detail: string;
  timestampUtc: string;
  action: string;
}

export interface BillingInvoiceRow {
  tenant: string;
  plan: string;
  amount: string;
  lastInvoice: string;
  status: string;
}

export interface ProvisionedTenant {
  tenantId: string;
  tenantCode: string;
  inviteUrl?: string;
}

export interface ImpersonationSession {
  userId: string;
  email: string;
  tenantId: string;
  token: string;
  referenceTicket: string;
}
