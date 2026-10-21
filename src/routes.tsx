import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/shell";
import { RequireAdminAuth } from "@/lib/auth";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { PlatformDashboardPage } from "@/pages/dashboard/PlatformDashboardPage";
import { ApprovalQueuePage } from "@/pages/approvals/ApprovalQueuePage";
import { RequestReviewPage } from "@/pages/approvals/RequestReviewPage";
import { ProvisionPage } from "@/pages/approvals/ProvisionPage";
import { TenantsListPage } from "@/pages/tenants/TenantsListPage";
import { TenantDetailsPage } from "@/pages/tenants/TenantDetailsPage";
import { BillingPlansPage } from "@/pages/billing/BillingPlansPage";
import { FeatureFlagsPage } from "@/pages/flags/FeatureFlagsPage";
import { PlatformUsersPage } from "@/pages/users/PlatformUsersPage";
import { AuditLogPage } from "@/pages/audit/AuditLogPage";
import { ConsoleSettingsPage } from "@/pages/settings/ConsoleSettingsPage";
import { Page } from "@/components/layout/shell";
import { EmptyState } from "@/components/ui";

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
        <Route path="/dashboard" element={<PlatformDashboardPage />} />
        <Route path="/approvals" element={<ApprovalQueuePage />} />
        <Route path="/approvals/:requestId" element={<RequestReviewPage />} />
        <Route
          path="/approvals/:requestId/provision"
          element={<ProvisionPage />}
        />
        <Route path="/tenants" element={<TenantsListPage />} />
        <Route path="/tenants/:tenantId" element={<TenantDetailsPage />} />
        <Route path="/billing" element={<BillingPlansPage />} />
        <Route path="/feature-flags" element={<FeatureFlagsPage />} />
        <Route path="/users" element={<PlatformUsersPage />} />
        <Route path="/audit-log" element={<AuditLogPage />} />
        <Route path="/settings" element={<ConsoleSettingsPage />} />
        <Route
          path="*"
          element={
            <Page>
              <EmptyState
                title="Page not found"
                description="Use the console navigation on the left."
              />
            </Page>
          }
        />
      </Route>
    </Routes>
  );
}
