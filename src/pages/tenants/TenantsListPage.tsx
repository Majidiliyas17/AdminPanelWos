import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CheckCircle2, Clock, PackageX } from "lucide-react";
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
import { computeTenantKpis } from "@/lib/platformApi";
import { describeApiError } from "@/lib/api";
import type { TenantRow } from "@/lib/platformTypes";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const statusTone: Record<string, Tone> = {
  Active: "success",
  Trial: "warning",
  Suspended: "danger",
  Provisioning: "info",
};

const TABS = ["All", "Active", "Trial", "Suspended"];

export function TenantsListPage() {
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const { data, loading, error, reload } = useAsync(
    () => platformApi.listTenants(),
    [],
  );

  const rows = useMemo(() => {
    let list = data?.items ?? [];
    if (tab !== "All") list = list.filter((t) => t.status === tab);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, tab, query]);

  const kpis = useMemo(() => computeTenantKpis(data?.items ?? []), [data]);

  const countries = useMemo(() => {
    const set = new Set(
      (data?.items ?? []).map((t) => t.country).filter(Boolean),
    );
    return set.size;
  }, [data]);

  const columns: Column<TenantRow>[] = [
    {
      key: "name",
      header: "Tenant",
      render: (row) => (
        <Link
          to={`/tenants/${row.id}`}
          className="text-ink-900 hover:text-primary hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    { key: "code", header: "Tenant ID", mono: true },
    { key: "plan", header: "Plan" },
    {
      key: "warehouses",
      header: "Warehouses",
      render: (row) => row.warehouses ?? "—",
    },
    {
      key: "since",
      header: "Since",
      mono: true,
      render: (row) => row.since ?? "—",
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
        breadcrumb={["WarehouseOS", "Platform Console", "Tenants"]}
        title="Tenants"
        subtitle="Every organization running on WarehouseOS"
        action={
          <Link to="/approvals">
            <button className="rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-primary-dark">
              + Provision Tenant
            </button>
          </Link>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Tenants"
          value={kpis.total}
          icon={<Building2 className="size-4" />}
          delta={
            <DeltaPill direction="up">
              {countries ? `across ${countries} countries` : "no tenants yet"}
            </DeltaPill>
          }
        />
        <StatCard
          label="Active"
          value={kpis.active}
          icon={<CheckCircle2 className="size-4" />}
          delta={
            <DeltaPill direction="up">
              {kpis.total
                ? `${Math.round((kpis.active / kpis.total) * 100)}% of total`
                : "—"}
            </DeltaPill>
          }
        />
        <StatCard
          label="Trial"
          value={kpis.trial}
          icon={<Clock className="size-4" />}
          delta={
            <DeltaPill direction="up">
              {kpis.trial ? "converting" : "none in trial"}
            </DeltaPill>
          }
        />
        <StatCard
          label="Suspended"
          value={kpis.suspended}
          icon={<PackageX className="size-4" />}
          delta={
            kpis.suspended > 0 ? (
              <DeltaPill direction="down" tone="danger">
                needs attention
              </DeltaPill>
            ) : (
              <DeltaPill direction="up">all healthy</DeltaPill>
            )
          }
        />
      </div>

      <section className="mt-4 rounded-xl border border-[#ececef] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <header className="flex items-center justify-between gap-3 border-b border-[#f3f4f6] px-4 py-3">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
            <span className="grid size-5 place-items-center rounded-md bg-primary-tint text-primary">
              <Building2 className="size-3" />
            </span>
            All Tenants
          </h3>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tenant or ID…"
            className="h-8 w-52 rounded-lg border border-line px-2.5 text-[11px] outline-none focus:border-primary"
          />
        </header>
        <div className="px-4 pt-3">
          <Tabs items={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="p-4 pt-2">
          {loading && <SkeletonTable rows={6} cols={6} />}
          {error && (
            <ErrorState
              onRetry={reload}
              description={describeApiError(error)}
            />
          )}
          {!loading && !error && rows.length === 0 && (
            <EmptyState
              title="No tenants match"
              description="Try another status tab or clear the search."
            />
          )}
          {!loading && !error && rows.length > 0 && (
            <>
              <DataTable
                columns={columns}
                rows={rows}
                rowKey={(row) => row.id}
              />
              <PaginationLine total={rows.length} pageSize={10} />
            </>
          )}
        </div>
      </section>
    </Page>
  );
}
