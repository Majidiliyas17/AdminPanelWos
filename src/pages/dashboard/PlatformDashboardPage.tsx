import { Link } from "react-router-dom";
import { BadgeCheck, Building2, Clock, FileText } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import {
  DataTable,
  DeltaPill,
  ErrorState,
  PanelCard,
  Skeleton,
  StatCard,
  StatusChip,
  type Column,
} from "@/components/ui";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { describeApiError } from "@/lib/api";
import { useAdminAuth } from "@/lib/auth";
import { relativeTime } from "@/lib/time";
import type { ApprovalRequest } from "@/lib/platformTypes";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const statusTone: Record<string, Tone> = {
  Active: "success",
  Trial: "warning",
  Suspended: "danger",
  Provisioning: "info",
  Pending: "warning",
  "In Review": "info",
  Approved: "success",
  Rejected: "danger",
  Paid: "success",
  Overdue: "danger",
};

export function PlatformDashboardPage() {
  const { user } = useAdminAuth();
  const firstName = (user?.name ?? "").split(" ")[0] || "there";
  const { data, loading, error, reload } = useAsync(
    () => platformApi.dashboard(),
    [],
  );
  const subtitle = `Good morning, ${firstName} · here's how the platform is performing today`;

  if (loading) {
    return (
      <Page>
        <PageHeader
          breadcrumb={["WarehouseOS", "Platform Console", "Dashboard"]}
          title="Platform Dashboard"
          subtitle={subtitle}
        />
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[110px]" />
          ))}
        </div>
        <Skeleton className="mt-4 h-40" />
        <Skeleton className="mt-4 h-64" />
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <PageHeader
          breadcrumb={["WarehouseOS", "Platform Console", "Dashboard"]}
          title="Platform Dashboard"
          subtitle={subtitle}
        />
        <ErrorState onRetry={reload} description={describeApiError(error)} />
      </Page>
    );
  }

  const kpis = data!.kpis;

  const topColumns: Column<{
    tenant: string;
    plan: string;
    footprint: string;
    mrr: string;
    status: string;
  }>[] = [
    { key: "tenant", header: "Tenant" },
    { key: "plan", header: "Plan" },
    { key: "footprint", header: "Footprint" },
    { key: "mrr", header: "MRR" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusChip
          tone={statusTone[row.status] ?? "neutral"}
          label={row.status}
        />
      ),
    },
  ];

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Dashboard"]}
        title="Platform Dashboard"
        subtitle={subtitle}
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Tenants"
          value={kpis.totalTenants}
          icon={<Building2 className="size-4" />}
          delta={<DeltaPill direction="up">{kpis.totalTenantsDelta}</DeltaPill>}
        />
        <StatCard
          label="Active Tenants"
          value={kpis.activeTenants}
          icon={<BadgeCheck className="size-4" />}
          delta={
            <DeltaPill direction="up">{kpis.activeTenantsDelta}</DeltaPill>
          }
        />
        <StatCard
          label="Pending Approvals"
          value={kpis.pendingApprovals}
          icon={<Clock className="size-4" />}
          delta={
            kpis.pendingApprovals > 0 ? (
              <DeltaPill direction="down" tone="danger">
                {kpis.pendingApprovalsDelta}
              </DeltaPill>
            ) : (
              <DeltaPill direction="up">{kpis.pendingApprovalsDelta}</DeltaPill>
            )
          }
        />
        <StatCard
          label="MRR"
          value={kpis.mrr}
          icon={<FileText className="size-4" />}
          delta={<DeltaPill direction="up">{kpis.mrrDelta}</DeltaPill>}
        />
      </div>

      <PanelCard
        className="mt-4"
        title="Pending Tenant Requests"
        icon={<BadgeCheck className="size-3.5" />}
        action={
          <Link
            to="/approvals"
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            View All
          </Link>
        }
      >
        <div className="grid grid-cols-3 gap-3">
          {data!.pendingRequests.length === 0 && (
            <p className="col-span-3 text-[12px] text-ink-500">
              No pending requests right now.
            </p>
          )}
          {data!.pendingRequests.map((request: ApprovalRequest) => (
            <Link
              key={request.id}
              to={`/approvals/${request.id}`}
              className="rounded-xl border border-line bg-white p-3 transition-colors hover:border-primary/40 hover:bg-primary-tint/40"
            >
              <StatusChip
                tone={statusTone[request.status] ?? "neutral"}
                label={request.status}
              />
              <p className="mt-2 text-[13px] font-bold text-ink-900">
                {request.companyName}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-500">
                Applied {relativeTime(request.submittedAtUtc)} ·{" "}
                {request.country}
              </p>
            </Link>
          ))}
        </div>
      </PanelCard>

      <PanelCard
        className="mt-4"
        title="Top Tenants by MRR"
        icon={<Building2 className="size-3.5" />}
      >
        <DataTable
          columns={topColumns}
          rows={data!.topTenants}
          rowKey={(row) => row.tenant}
        />
      </PanelCard>
    </Page>
  );
}
