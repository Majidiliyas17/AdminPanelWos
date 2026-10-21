import { useMemo, useState } from "react";
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
import { platformApi, computeApprovalKpis } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { describeApiError } from "@/lib/api";
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
    () => platformApi.listRequests(),
    [tab],
  );
  const all = data?.items ?? [];
  const filtered = useMemo(
    () => all.filter((r) => tab === "All" || r.status === tab),
    [all, tab],
  );
  const kpis = useMemo(() => computeApprovalKpis(all), [all]);

  const avgReviewHours = useMemo(() => {
    const reviewed = all.filter((r) => r.reviewedAtUtc);
    if (!reviewed.length) return null;
    const total = reviewed.reduce(
      (sum, r) =>
        sum +
        (new Date(r.reviewedAtUtc as string).getTime() -
          new Date(r.submittedAtUtc).getTime()),
      0,
    );
    return total / reviewed.length / 3600000;
  }, [all]);

  const columns: Column<ApprovalRequest>[] = [
    {
      key: "companyName",
      header: "Company",
      render: (row) => (
        <Link
          to={`/approvals/${row.id}`}
          className="text-ink-900 hover:text-primary hover:underline"
        >
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
        breadcrumb={["WarehouseOS", "Platform Console", "Approvals"]}
        title="Tenant Approval Queue"
        subtitle="Review and decide on new organization requests"
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Pending Requests"
          value={kpis.pending}
          icon={<Clock className="size-4" />}
          delta={
            kpis.pending > 0 ? (
              <DeltaPill direction="down" tone="danger">
                awaiting review
              </DeltaPill>
            ) : (
              <DeltaPill direction="up">queue clear</DeltaPill>
            )
          }
        />
        <StatCard
          label="Approved (all time)"
          value={kpis.approved}
          icon={<CheckCircle2 className="size-4" />}
          delta={<DeltaPill direction="up">total approved</DeltaPill>}
        />
        <StatCard
          label="Rejected (all time)"
          value={kpis.rejected}
          icon={<PackageX className="size-4" />}
          delta={
            kpis.rejected > 0 ? (
              <DeltaPill direction="down" tone="danger">
                total rejected
              </DeltaPill>
            ) : (
              <DeltaPill direction="up">none rejected</DeltaPill>
            )
          }
        />
        <StatCard
          label="Avg. Review Time"
          value={
            avgReviewHours != null ? (
              <>
                {avgReviewHours.toFixed(1)}
                <span className="ml-1 text-[11px] font-medium text-ink-500">
                  hours
                </span>
              </>
            ) : (
              "—"
            )
          }
          icon={<Timer className="size-4" />}
          delta={
            <DeltaPill direction="up">
              {avgReviewHours != null ? "across reviewed" : "no reviews yet"}
            </DeltaPill>
          }
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
          {error && (
            <ErrorState
              onRetry={reload}
              description={describeApiError(error)}
            />
          )}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState
              title="No requests in this tab"
              description="New organization requests will show up here."
            />
          )}
          {!loading && !error && filtered.length > 0 && (
            <>
              <DataTable
                columns={columns}
                rows={filtered}
                rowKey={(row) => row.id}
              />
              <PaginationLine total={all.length} />
            </>
          )}
        </div>
      </section>
    </Page>
  );
}
