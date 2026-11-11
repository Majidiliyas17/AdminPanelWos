import { Link } from "react-router-dom";
import { BadgeCheck, Building2, Clock, FileText } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import {
  DataTable,
  ErrorState,
  InfoPill,
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
        title={`Good morning, ${firstName}`}
        subtitle="Here’s what’s happening across your platform today."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          label="Total Tenants"
          value={kpis.totalTenants}
          icon={<Building2 className="size-4" />}
          delta={<InfoPill>{kpis.totalTenantsDelta}</InfoPill>}
        />
        <StatCard
          label="Active Tenants"
          value={kpis.activeTenants}
          icon={<BadgeCheck className="size-4" />}
          iconTone="success"
          delta={<InfoPill tone="success">{kpis.activeTenantsDelta}</InfoPill>}
        />
        <StatCard
          label="Pending Approvals"
          value={kpis.pendingApprovals}
          icon={<Clock className="size-4" />}
          iconTone={kpis.pendingApprovals === 0 ? "success" : "brand"}
          delta={
            kpis.pendingApprovals > 0 ? (
              <InfoPill tone="danger">{kpis.pendingApprovalsDelta}</InfoPill>
            ) : (
              <InfoPill tone="success">{kpis.pendingApprovalsDelta}</InfoPill>
            )
          }
        />
        <StatCard
          label="MRR"
          value={kpis.mrr}
          icon={<FileText className="size-4" />}
          delta={<InfoPill>{kpis.mrrDelta}</InfoPill>}
        />
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_2px_10px_rgb(63_49_119/5%),0_18px_42px_-28px_rgb(105_85_232/24%)]">
        <div className="grid xl:grid-cols-[1.15fr_.85fr]">
          <div className="min-w-0 p-5 sm:p-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success-tint px-2.5 py-1 text-[10.5px] font-bold tracking-[0.08em] text-success uppercase"><span className="status-dot-live size-1.5 rounded-full bg-success"/> Platform operations</span>
            <h2 className="mt-3 text-[21px] leading-tight font-bold tracking-tight text-ink-900 sm:text-[24px]">Your warehouse network, at a glance.</h2>
            <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-ink-500">Review tenant requests, platform activity and account health from one command center.</p>
            <div className="warehouse-scene warehouse-route-scene mt-5" aria-hidden="true">
              <div className="warehouse-road"><i/></div><span className="warehouse-truck"><img src="/images/warehouse-truck-v1.png" alt="" draggable="false"/></span>
            </div>
          </div>
          <div className="border-t border-line bg-brand-tint-soft p-5 sm:p-6 xl:border-t-0 xl:border-l">
            <div className="flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-[14px] font-bold text-ink-900"><span className="grid size-7 place-items-center rounded-lg bg-brand-tint text-brand-violet"><Clock className="size-3.5"/></span> Pending tenant requests</h3><Link to="/approvals" className="text-[11.5px] font-semibold text-primary hover:underline">View all</Link></div>
            <p className="mt-2 text-[12px] text-ink-500">{data!.pendingRequests.length > 0 ? `${data!.pendingRequests.length} request${data!.pendingRequests.length === 1 ? "" : "s"} waiting for review` : "No requests are waiting for review."}</p>
            <div className="mt-4 space-y-2.5">
              {data!.pendingRequests.map((request) => (
                <Link key={request.id} to={`/approvals/${request.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 transition-colors hover:border-primary/25">
                  <span className="min-w-0"><span className="block truncate text-[12px] font-semibold text-ink-900">{request.companyName}</span><span className="mt-1 block truncate text-[10.5px] text-ink-500">{request.country} · Applied {relativeTime(request.submittedAtUtc)}</span></span><StatusChip tone={statusTone[request.status] ?? "neutral"} label={request.status}/>
                </Link>
              ))}
              {data!.pendingRequests.length === 0 && <div className="rounded-xl border border-success/15 bg-surface px-3.5 py-4 text-[12px] text-ink-500"><span className="font-semibold text-success">All caught up.</span> New tenant applications will appear here.</div>}
            </div>
          </div>
        </div>
      </section>

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
