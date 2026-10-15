import type {
  ApprovalRequest,
  AuditEvent,
  BillingInvoiceRow,
  FeatureFlagRow,
  PlatformPlan,
  PlatformStaff,
  ProvisionedTenant,
  TenantOverride,
  TenantRow,
  TenantUsageMetric,
} from "@/lib/platformTypes";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const PLATFORM_ACCOUNT = {
  id: "01990000-0000-7000-8000-0000000000rk",
  email: "platform@warehouseos.local",
  password: "Platform@12345",
};

export const dashboardKpis = {
  totalTenants: 64,
  totalTenantsDelta: "across 22 countries",
  activeTenants: 58,
  activeTenantsDelta: "91% healthy",
  pendingApprovals: 7,
  pendingApprovalsDelta: "needs review",
  mrr: "$412K",
  mrrDelta: "8% vs last month",
};

export const topTenantsByMrr = [
  { tenant: "NorthStar Logistics", plan: "Enterprise", footprint: "12 warehouses", mrr: "$8,400/mo", status: "Active" },
  { tenant: "Rhein Fulfillment", plan: "Growth", footprint: "4 warehouses", mrr: "$1,900/mo", status: "Active" },
  { tenant: "Gulf Trade Logistics", plan: "Growth", footprint: "3 warehouses", mrr: "$1,400/mo", status: "Active" },
  { tenant: "Meridian Cold Chain", plan: "Starter", footprint: "1 warehouse", mrr: "$390/mo", status: "Trial" },
  { tenant: "Apex Distribution", plan: "—", footprint: "—", mrr: "—", status: "Suspended" },
];

export const approvalKpis = {
  pending: 7,
  pendingDelta: "awaiting review",
  approved30d: 18,
  approvedDelta: "94% approval rate",
  rejected30d: 1,
  rejectedDelta: "incomplete application",
  avgReviewTime: "6",
  avgReviewUnit: "hrs",
  avgReviewDelta: "from request to decision",
};

export const mockRequests: ApprovalRequest[] = [
  {
    id: "01990000-0000-7000-8000-00000000s001",
    companyName: "Southern Cross Logistics",
    country: "Australia",
    warehouseType: "3PL",
    contactName: "Jack Fenwick, Operations Director",
    email: "jack@southerncrosslog.com.au",
    requestedPlan: "Growth",
    status: "Pending",
    submittedAtUtc: hoursAgo(2),
    estimatedWarehouses: 4,
    estimatedMrr: "$1,900/mo estimated",
    region: "Australia region",
    checks: 4,
  },
  {
    id: "01990000-0000-7000-8000-00000000s002",
    companyName: "Tokyo Industrial Supply",
    country: "Japan",
    warehouseType: "Manufacturing",
    contactName: "Yuki Tanaka, VP Operations",
    email: "yuki@tokyo-industrial.co.jp",
    requestedPlan: "Growth",
    status: "Pending",
    submittedAtUtc: daysAgo(1),
    estimatedWarehouses: 3,
    estimatedMrr: "$1,900/mo estimated",
    region: "Japan region",
    checks: 4,
  },
  {
    id: "01990000-0000-7000-8000-00000000s003",
    companyName: "Pacific Fulfillment Co.",
    country: "Singapore",
    warehouseType: "E-commerce",
    contactName: "Wei Chen, Head of Ops",
    email: "wei@pacificfulfillment.sg",
    requestedPlan: "Starter",
    status: "Pending",
    submittedAtUtc: daysAgo(2),
    estimatedWarehouses: 2,
    estimatedMrr: "$390/mo estimated",
    region: "Singapore region",
    checks: 4,
  },
  {
    id: "01990000-0000-7000-8000-00000000s004",
    companyName: "Rhein Cold Storage",
    country: "Germany",
    warehouseType: "Cold Storage",
    contactName: "Lena Vogt, Managing Director",
    email: "lena@rheincold.de",
    requestedPlan: "Growth",
    status: "In Review",
    submittedAtUtc: daysAgo(2),
    estimatedWarehouses: 3,
    estimatedMrr: "$1,900/mo estimated",
    region: "Germany region",
    checks: 4,
  },
  {
    id: "01990000-0000-7000-8000-00000000s005",
    companyName: "Delta Bonded Warehousing",
    country: "UAE",
    warehouseType: "Bonded",
    contactName: "Omar Al-Farsi, COO",
    email: "omar@deltabonded.ae",
    requestedPlan: "Enterprise",
    status: "Pending",
    submittedAtUtc: daysAgo(3),
    estimatedWarehouses: 6,
    estimatedMrr: "Custom pricing",
    region: "UAE region",
    checks: 4,
  },
];

export const automatedChecks = [
  "Business email domain verified",
  "Company registration matched",
  "No duplicate tenant found",
  "Not on restricted-country list",
];

export const tenantKpis = {
  total: 64,
  totalDelta: "across 22 countries",
  active: 58,
  activeDelta: "91% of total",
  trial: 4,
  trialDelta: "converting within 14 days",
  suspended: 2,
  suspendedDelta: "billing or compliance hold",
};

export const mockTenants: TenantRow[] = [
  {
    id: "01990000-0000-7000-8000-00000000t101",
    name: "NorthStar Logistics",
    code: "tnt_northstar_1042",
    plan: "Enterprise",
    warehouses: 12,
    since: "Mar 2023",
    status: "Active",
    country: "United States",
    currency: "USD",
    mrr: 8400,
    healthScore: 96,
    activeUsers: 48,
    userSeats: 100,
    regionCount: 4,
    memberSince: "March 2023",
    platformInvoices: [
      { invoice: "INV-PLT-2209", period: "Sep 2026", amount: "$8,400.00", status: "Paid" },
      { invoice: "INV-PLT-2208", period: "Aug 2026", amount: "$8,400.00", status: "Paid" },
    ],
    usage: [
      { metric: "API Calls (30d)", current: "182,400", limit: "of 500,000" },
      { metric: "Storage Used", current: "64 GB", limit: "of 200 GB" },
      { metric: "Active Integrations", current: "4", limit: "WhatsApp, Email, Accounting, API" },
    ],
  },
  {
    id: "01990000-0000-7000-8000-00000000t102",
    name: "Rhein Fulfillment",
    code: "tnt_rhein_5521",
    plan: "Growth",
    warehouses: 4,
    since: "Jan 2024",
    status: "Active",
    country: "Germany",
    currency: "EUR",
    mrr: 1900,
    healthScore: 91,
    activeUsers: 18,
    userSeats: 25,
    regionCount: 1,
    memberSince: "January 2024",
    platformInvoices: [
      { invoice: "INV-PLT-2207", period: "Sep 2026", amount: "$1,900.00", status: "Paid" },
      { invoice: "INV-PLT-2188", period: "Aug 2026", amount: "$1,900.00", status: "Paid" },
    ],
    usage: [
      { metric: "API Calls (30d)", current: "54,100", limit: "of 200,000" },
      { metric: "Storage Used", current: "22 GB", limit: "of 100 GB" },
      { metric: "Active Integrations", current: "2", limit: "Email, Accounting" },
    ],
  },
  {
    id: "01990000-0000-7000-8000-00000000t103",
    name: "Gulf Trade Logistics",
    code: "tnt_gulftrade_3390",
    plan: "Growth",
    warehouses: 3,
    since: "Jun 2024",
    status: "Active",
    country: "UAE",
    currency: "AED",
    mrr: 1400,
    healthScore: 88,
    activeUsers: 14,
    userSeats: 25,
    regionCount: 1,
    memberSince: "June 2024",
    platformInvoices: [{ invoice: "INV-PLT-2175", period: "Sep 2026", amount: "$1,400.00", status: "Paid" }],
    usage: [
      { metric: "API Calls (30d)", current: "41,020", limit: "of 200,000" },
      { metric: "Storage Used", current: "18 GB", limit: "of 100 GB" },
      { metric: "Active Integrations", current: "1", limit: "Email" },
    ],
  },
  {
    id: "01990000-0000-7000-8000-00000000t104",
    name: "Meridian Cold Chain",
    code: "tnt_meridian_9012",
    plan: "Starter",
    warehouses: 1,
    since: "22 Aug 2026",
    status: "Trial",
    country: "United States",
    currency: "USD",
    mrr: 390,
    healthScore: 74,
    activeUsers: 6,
    userSeats: 10,
    regionCount: 1,
    memberSince: "August 2026",
    platformInvoices: [{ invoice: "INV-PLT-2210", period: "Sep 2026", amount: "$390.00", status: "Paid" }],
    usage: [
      { metric: "API Calls (30d)", current: "8,450", limit: "of 50,000" },
      { metric: "Storage Used", current: "4 GB", limit: "of 25 GB" },
      { metric: "Active Integrations", current: "1", limit: "Email" },
    ],
  },
  {
    id: "01990000-0000-7000-8000-00000000t105",
    name: "Apex Distribution",
    code: "tnt_apex_2207",
    plan: "Starter",
    warehouses: 2,
    since: "Nov 2024",
    status: "Suspended",
    country: "United Kingdom",
    currency: "GBP",
    mrr: 390,
    healthScore: 42,
    activeUsers: 8,
    userSeats: 10,
    regionCount: 1,
    memberSince: "November 2024",
    platformInvoices: [
      { invoice: "INV-PLT-2101", period: "Jul 2026", amount: "$390.00", status: "Overdue" },
      { invoice: "INV-PLT-2088", period: "Jun 2026", amount: "$390.00", status: "Paid" },
    ],
    usage: [
      { metric: "API Calls (30d)", current: "2,100", limit: "of 50,000" },
      { metric: "Storage Used", current: "3 GB", limit: "of 25 GB" },
      { metric: "Active Integrations", current: "0", limit: "—" },
    ],
  },
  {
    id: "01990000-0000-7000-8000-00000000t106",
    name: "Southern Cross Logistics",
    code: "tnt_southerncross_8214",
    plan: "Growth",
    warehouses: 0,
    since: "04 Sep 2026",
    status: "Provisioning",
    country: "Australia",
    currency: "AUD",
    mrr: 1900,
    healthScore: 0,
    activeUsers: 0,
    userSeats: 25,
    regionCount: 0,
    memberSince: "September 2026",
    platformInvoices: [],
    usage: [],
  },
];

export const billingKpis = {
  mrr: "$412K",
  mrrDelta: "across 64 tenants",
  collectionRate: "97.2",
  collectionUnit: "%",
  collectionDelta: "last 30 days",
  overdue: 2,
  overdueDelta: "needs follow-up",
  avgRevenue: "$6,437",
  avgRevenueDelta: "per month",
};

export const mockPlans: PlatformPlan[] = [
  {
    id: "plan-starter",
    name: "Starter",
    monthlyPrice: 390,
    maxWarehouses: 2,
    maxUserSeats: 10,
    warehousesLabel: "Up to 2 warehouses",
    seatsLabel: "10 user seats",
    priceLabel: "$390",
    highlighted: false,
    active: true,
  },
  {
    id: "plan-growth",
    name: "Growth",
    monthlyPrice: 1900,
    maxWarehouses: 10,
    maxUserSeats: 25,
    warehousesLabel: "Up to 10 warehouses",
    seatsLabel: "25 user seats",
    priceLabel: "$1,900",
    highlighted: true,
    active: true,
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    monthlyPrice: 9999,
    maxWarehouses: 9999,
    maxUserSeats: 99999,
    warehousesLabel: "Unlimited warehouses",
    seatsLabel: "Unlimited seats",
    priceLabel: "Custom",
    highlighted: false,
    active: true,
  },
];

export const billingInvoiceRows: BillingInvoiceRow[] = [
  { tenant: "NorthStar Logistics", plan: "Enterprise", amount: "$8,400.00", lastInvoice: "01 Sep 2026", status: "Paid" },
  { tenant: "Rhein Fulfillment", plan: "Growth", amount: "$1,900.00", lastInvoice: "01 Sep 2026", status: "Paid" },
  { tenant: "Apex Distribution", plan: "Starter", amount: "$390.00", lastInvoice: "15 Jul 2026", status: "Overdue" },
];

export const flagKpis = {
  total: 18,
  totalDelta: "across 4 categories",
  enterpriseOnly: 6,
  enterpriseDelta: "premium differentiation",
  overrides: 2,
  overridesDelta: "manual exceptions",
  lastChanged: "2",
  lastChangedUnit: "hrs ago",
  lastChangedDelta: "by Riya Kapoor",
};

export const mockFlags: FeatureFlagRow[] = [
  {
    id: "flag-ai",
    key: "ai_assistant",
    name: "AI Assistant",
    description: "Ask-about-inventory and anomaly detection",
    starter: false,
    growth: true,
    enterprise: true,
    active: true,
  },
  {
    id: "flag-portal",
    key: "customer_portal",
    name: "Customer Portal",
    description: "Scoped external access for tenant customers",
    starter: false,
    growth: true,
    enterprise: true,
    active: true,
  },
  {
    id: "flag-forecast",
    key: "demand_forecasting",
    name: "Demand Forecasting",
    description: "Predictive analytics on inventory and capacity",
    starter: false,
    growth: false,
    enterprise: true,
    active: true,
  },
  {
    id: "flag-transfers",
    key: "multi_warehouse_transfers",
    name: "Multi-Warehouse Transfers",
    description: "Inter-warehouse stock transfers",
    starter: false,
    growth: true,
    enterprise: true,
    active: true,
  },
  {
    id: "flag-api",
    key: "custom_integrations",
    name: "Custom Integrations (API)",
    description: "Scoped API keys and webhooks",
    starter: false,
    growth: false,
    enterprise: true,
    active: true,
  },
  {
    id: "flag-brand",
    key: "white_label",
    name: "White-Label Branding",
    description: "Replace WarehouseOS branding in portal",
    starter: false,
    growth: false,
    enterprise: true,
    active: true,
  },
];

export const mockOverrides: TenantOverride[] = [
  { tenant: "Rhein Fulfillment", feature: "Demand Forecasting", override: "Enabled early access", setBy: "Sofia Alvarez" },
  { tenant: "Meridian Cold Chain", feature: "AI Assistant", override: "Disabled during trial", setBy: "Riya Kapoor" },
];

export const roleCards = [
  {
    role: "Super Admin",
    description: "Full platform access: tenants, billing, flags, staff",
  },
  {
    role: "Support Lead",
    description: "Tenant support, impersonation, no billing changes",
  },
  {
    role: "Support",
    description: "Read-only tenant access for troubleshooting",
  },
  {
    role: "Billing Ops",
    description: "Platform billing and invoicing only",
  },
];

export const userKpis = {
  staff: 14,
  staffDelta: "across 3 roles",
  superAdmins: 3,
  superAdminsDelta: "full platform access",
  support: 9,
  supportDelta: "tenant support access",
  activeToday: 8,
  activeTodayDelta: "logged in today",
};

export const mockStaff: PlatformStaff[] = [
  {
    id: "staff-1",
    name: "Riya Kapoor",
    role: "Super Admin",
    email: "riya@warehouseos.com",
    status: "Active",
    lastLogin: "04 Sep, 08:02",
  },
  {
    id: "staff-2",
    name: "Daniel Cho",
    role: "Super Admin",
    email: "daniel@warehouseos.com",
    status: "Active",
    lastLogin: "04 Sep, 07:40",
  },
  {
    id: "staff-3",
    name: "Amara Okonkwo",
    role: "Support Lead",
    email: "amara@warehouseos.com",
    status: "Active",
    lastLogin: "04 Sep, 09:12",
  },
  {
    id: "staff-4",
    name: "Leo Marchetti",
    role: "Support",
    email: "leo@warehouseos.com",
    status: "Active",
    lastLogin: "03 Sep, 17:20",
  },
  {
    id: "staff-5",
    name: "Nina Petrova",
    role: "Billing Ops",
    email: "nina@warehouseos.com",
    status: "Inactive",
    lastLogin: "28 Aug, 14:05",
  },
];

export const auditKpis = {
  eventsToday: 24,
  eventsDelta: "across the platform",
  activeStaff: 8,
  activeStaffDelta: "logged in today",
  tenantActions: 6,
  tenantActionsDelta: "provisioned, suspended, changed",
  impersonations: 1,
  impersonationsDelta: "logged with ticket reference",
};

export const mockAudit: AuditEvent[] = [
  {
    id: "audit-1",
    title: "Tenant Approved",
    detail: "Southern Cross Logistics → tnt_southerncross_8214 · by Riya Kapoor",
    timestampUtc: "2026-09-04T09:40:00Z",
    action: "TenantRequestApproved",
  },
  {
    id: "audit-2",
    title: "Tenant Provisioned",
    detail: "Growth plan, AUD, 14-day trial · by System",
    timestampUtc: "2026-09-04T09:41:00Z",
    action: "TenantProvisioned",
  },
  {
    id: "audit-3",
    title: "Impersonated Tenant",
    detail: "NorthStar Logistics — support ticket #4021 · by Amara Okonkwo",
    timestampUtc: "2026-09-04T08:15:00Z",
    action: "TenantImpersonated",
  },
  {
    id: "audit-4",
    title: "Plan Changed",
    detail: "Rhein Fulfillment: Starter → Growth · by Nina Petrova",
    timestampUtc: "2026-09-03T16:00:00Z",
    action: "PlanChanged",
  },
  {
    id: "audit-5",
    title: "Tenant Suspended",
    detail: "Apex Distribution — overdue payment, 45 days · by Riya Kapoor",
    timestampUtc: "2026-09-03T11:20:00Z",
    action: "TenantSuspended",
  },
  {
    id: "audit-6",
    title: "Feature Flag Changed",
    detail: "Demand Forecasting enabled for Rhein Fulfillment · by Daniel Cho",
    timestampUtc: "2026-09-02T14:10:00Z",
    action: "FeatureFlagUpdated",
  },
];

export function tenantCodeFromCompany(company: string): string {
  let slug = company
    .trim()
    .toLowerCase()
    .split("")
    .map((ch) => (/[a-z0-9]/.test(ch) ? ch : "-"))
    .join("");
  while (slug.includes("--")) slug = slug.replace("--", "-");
  slug = slug.replace(/^-+|-+$/g, "");
  if (slug.length > 40) slug = slug.slice(0, 40).replace(/-+$/g, "");
  if (!slug) slug = "tenant";
  const n = 1000 + Math.floor(Math.random() * 9000);
  return `tnt_${slug}_${n}`;
}

export function createMockProvisionedTenant(
  request: ApprovalRequest,
  planName: string,
  currency: string,
  warehouses: number,
  seats: number,
): ProvisionedTenant {
  const code = tenantCodeFromCompany(request.companyName);
  const tenantId = `01990000-0000-7000-8000-${code.replace(/[^a-z0-9]/gi, "").slice(-12).padStart(12, "0")}`;
  const plan = mockPlans.find((p) => p.name === planName) ?? mockPlans[1];
  const row: TenantRow = {
    id: tenantId,
    name: request.companyName,
    code,
    plan: planName,
    warehouses,
    since: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    status: "Provisioning",
    country: request.country,
    currency,
    mrr: plan.monthlyPrice,
    healthScore: 0,
    activeUsers: 0,
    userSeats: seats,
    regionCount: 0,
    memberSince: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    platformInvoices: [],
    usage: [],
  };
  if (!mockTenants.some((t) => t.code === code)) mockTenants.unshift(row);
  return { tenantId, tenantCode: code, inviteUrl: `http://localhost:5173/invite/mock-${code}` };
}

export function upsertMockPlan(plan: PlatformPlan) {
  const existing = mockPlans.findIndex((p) => p.id === plan.id);
  if (existing >= 0) mockPlans[existing] = plan;
  else mockPlans.push(plan);
}

export function upsertMockFlag(flag: FeatureFlagRow) {
  const existing = mockFlags.findIndex((f) => f.id === flag.id);
  if (existing >= 0) mockFlags[existing] = flag;
  else mockFlags.push(flag);
}

export function upsertMockStaff(staff: PlatformStaff) {
  const existing = mockStaff.findIndex((s) => s.id === staff.id);
  if (existing >= 0) mockStaff[existing] = staff;
  else mockStaff.push(staff);
}

export function pushMockAudit(event: Omit<AuditEvent, "id" | "timestampUtc">) {
  mockAudit.unshift({
    ...event,
    id: `audit-${Date.now()}`,
    timestampUtc: new Date().toISOString(),
  });
}

export function updateMockTenantStatus(tenantId: string, status: string) {
  const tenant = mockTenants.find((t) => t.id === tenantId);
  if (tenant) tenant.status = status;
}

export type { TenantUsageMetric };
