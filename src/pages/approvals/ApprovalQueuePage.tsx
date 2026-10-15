import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, CheckCircle2, Clock, PackageX, Timer } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import {
  DataTable,
  DeltaPill,
  EmptyState,
  ErrorState,
  PaginationLine,
  SkeletonTable,
  StatCard,
  StatusChip,
  Tabs,
  type Column,
} from "@/components/ui";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { relativeTime } from "@/lib/time";
import type { ApprovalRequest } from "@/lib/platformTypes";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const statusTone: Record<string, Tone> = {
  Pending: "warning",
  "In Review": "info",
  Approved: "success",
  Rejected: "danger",
};

const TABS = ["All", "Pending", "In Review", "Approved", "Rejected"];

export function ApprovalQueuePage() {
  const [tab, setTab] = useState("All");
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([platformApi.listRequests(), Promise.resolve(platformApi.approvalKpis)]),
    [tab],
  );
  const filtered = (data?.[0]?.items ?? []).filter((r) => tab === "All" || r.status === tab);
  const kpis = data?.[1];

  const columns: Column<ApprovalRequest>[] = [
    {
      key: "companyName",
      header: "Company",
      render: (row) => (
        <Link to={`/approvals/${row.id}`} className="text-ink-900 hover:text-primary hover:underline">
          {row.companyName}
        </Link>
      ),
    },
    { key: "country", header: "Country" },
    { key: "warehouseType", header: "Warehouse Type" },
    {
      key: "submittedAtUtc",
      header: "Submitted",
      mono: true,
      render: (row) => relativeTime(row.submittedAtUtc),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip tone={statusTone[row.status] ?? "neutral"} label={row.status} />,
    },
  ];

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Approvals"]}
        title="Tenant Approval Queue"
        subtitle="Review and decide on new organization requests"
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Pending Requests"
          value={kpis?.pending ?? "—"}
          icon={<Clock className="size-4" />}
          delta={
            <DeltaPill direction="down" tone="danger">
              {kpis?.pendingDelta ?? "awaiting review"}
            </DeltaPill>
          }
        />
        <StatCard
          label="Approved (30d)"
          value={kpis?.approved30d ?? "—"}
          icon={<CheckCircle2 className="size-4" />}
          delta={<DeltaPill direction="up">{kpis?.approvedDelta ?? ""}</DeltaPill>}
        />
        <StatCard
          label="Rejected (30d)"
          value={kpis?.rejected30d ?? "—"}
          icon={<PackageX className="size-4" />}
          delta={
            <DeltaPill direction="down" tone="danger">
              {kpis?.rejectedDelta ?? ""}
            </DeltaPill>
          }
        />
        <StatCard
          label="Avg. Review Time"
          value={
            kpis ? (
              <>
                {kpis.avgReviewTime}
                <span className="ml-1 text-[11px] font-medium text-ink-500">{kpis.avgReviewUnit}</span>
              </>
            ) : (
              "—"
            )
          }
          icon={<Timer className="size-4" />}
          delta={<DeltaPill direction="up">{kpis?.avgReviewDelta ?? ""}</DeltaPill>}
        />
      </div>

      <section className="mt-4 rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <header className="flex items-center justify-between gap-3 border-b border-[#f3f4f6] px-4 py-3">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
            <span className="grid size-5 place-items-center rounded-md bg-primary-tint text-primary">
              <BadgeCheck className="size-3" />
            </span>
            Tenant Approval Queue
          </h3>
        </header>
        <div className="px-4 pt-3">
          <Tabs items={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="p-4 pt-2">
          {loading && <SkeletonTable rows={5} cols={5} />}
          {error && <ErrorState onRetry={reload} />}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState title="No requests in this tab" description="New organization requests will show up here." />
          )}
          {!loading && !error && filtered.length > 0 && (
            <>
              <DataTable columns={columns} rows={filtered} rowKey={(row) => row.id} />
              <PaginationLine total={data![0].items.length} />
            </>
          )}
        </div>
      </section>
    </Page>
  );
}
