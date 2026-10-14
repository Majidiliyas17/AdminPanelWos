import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/shell";
import { RequireAdminAuth } from "@/lib/auth";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { Placeholder } from "@/pages/Placeholder";

interface ConsoleScreen {
  path: string;
  breadcrumb: string[];
  title: string;
  subtitle?: string;
  milestone: string;
  actionLabel?: string;
}

const screens: ConsoleScreen[] = [
  {
    path: "/dashboard",
    breadcrumb: ["WarehouseOS", "Platform Console", "Dashboard"],
    title: "Platform Dashboard",
    subtitle: "Good morning, Riya · here's how the platform is performing today",
    milestone: "AM1",
  },
  {
    path: "/approvals",
    breadcrumb: ["WarehouseOS", "Platform Console", "Approvals"],
    title: "Tenant Approval Queue",
    subtitle: "Review and decide on new organization requests",
    milestone: "AM2",
  },
  {
    path: "/approvals/:requestId",
    breadcrumb: ["WarehouseOS", "Platform Console", "Approvals", "Request"],
    title: "Approval Request Review",
    subtitle: "Reviewing new tenant application",
    milestone: "AM2",
    actionLabel: "✓ Approve & Provision",
  },
  {
    path: "/approvals/:requestId/provision",
    breadcrumb: ["WarehouseOS", "Platform Console", "Approvals", "Provision"],
    title: "Approve & Provision",
    subtitle: "Confirm plan and limits, then generate the tenant record",
    milestone: "AM2",
  },
  {
    path: "/tenants",
    breadcrumb: ["WarehouseOS", "Platform Console", "Tenants"],
    title: "Tenants",
    subtitle: "Every organization running on WarehouseOS",
    milestone: "AM3",
    actionLabel: "+ Provision Tenant",
  },
  {
    path: "/tenants/:tenantId",
    breadcrumb: ["WarehouseOS", "Platform Console", "Tenants"],
    title: "Tenant Details",
    subtitle: "Tenant plan, usage, invoices and controls",
    milestone: "AM3",
  },
  {
    path: "/billing",
    breadcrumb: ["WarehouseOS", "Platform Console", "Billing & Plans"],
    title: "Billing & Plans",
    subtitle: "Subscription tiers and platform-wide revenue",
    milestone: "AM4",
    actionLabel: "+ New Plan",
  },
  {
    path: "/feature-flags",
    breadcrumb: ["WarehouseOS", "Platform Console", "Feature Flags"],
    title: "Feature Flags",
    subtitle: "Control which features are available, by plan or by tenant",
    milestone: "AM4",
    actionLabel: "+ New Flag",
  },
  {
    path: "/users",
    breadcrumb: ["WarehouseOS", "Platform Console", "Platform Users"],
    title: "Platform Users",
    subtitle: "Staff with access to the Platform Console itself",
    milestone: "AM5",
    actionLabel: "+ Add Staff",
  },
  {
    path: "/audit-log",
    breadcrumb: ["WarehouseOS", "Platform Console", "Audit Log"],
    title: "Audit Log",
    subtitle: "Every platform-level action, across every tenant, fully traceable",
    milestone: "AM5",
  },
  {
    path: "/settings",
    breadcrumb: ["WarehouseOS", "Platform Console", "Settings"],
    title: "Console Settings",
    subtitle: "Platform staff profile, security and session policy",
    milestone: "AM5",
  },
];

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route
        element={
          <RequireAdminAuth>
            <AppShell />
          </RequireAdminAuth>
        }
      >
        {screens.map((screen) => (
          <Route
            key={screen.path}
            path={screen.path}
            element={
              <Placeholder
                breadcrumb={screen.breadcrumb}
                title={screen.title}
                subtitle={screen.subtitle}
                milestone={screen.milestone}
                actionLabel={screen.actionLabel}
              />
            }
          />
        ))}
        <Route path="*" element={<Placeholder breadcrumb={["WarehouseOS", "Platform Console"]} title="Page not found" milestone="—" />} />
      </Route>
    </Routes>
  );
}
