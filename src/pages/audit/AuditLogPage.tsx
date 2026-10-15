import { BadgeCheck, Building2, Clock, Download, Flag, ShieldCheck, UserCog, Users, Package, FileText } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import { DeltaPill, ErrorState, PanelCard, SkeletonTable, StatCard } from "@/components/ui";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { auditKpis } from "@/mocks/platform";
import { formatDateTime } from "@/lib/time";
import type { AuditEvent } from "@/lib/platformTypes";
import { cn } from "@/lib/cn";

const actionIcons: Array<{ match: (action: string, title: string) => boolean; icon: typeof BadgeCheck; tone: string }> = [
  { match: (a, t) => a.includes("Approved") || t.includes("Approved"), icon: BadgeCheck, tone: "bg-primary-tint text-primary" },
  { match: (a, t) => a.includes("Provision") || t.includes("Provision"), icon: Building2, tone: "bg-primary-tint text-brand-violet" },
  { match: (a) => a.includes("Impersonat"), icon: UserCog, tone: "bg-info-tint text-info" },
  { match: (a, t) => a.includes("Plan") || t.includes("Plan"), icon: FileText, tone: "bg-info-tint text-info" },
  { match: (a, t) => a.includes("Suspend") || a.includes("React") || t.includes("Suspend"), icon: Package, tone: "bg-warning-tint text-warning" },
  { match: (a, t) => a.includes("FeatureFlag") || t.includes("Feature Flag"), icon: Flag, tone: "bg-violet-tint text-brand-violet" },
  { match: () => true, icon: ShieldCheck, tone: "bg-[#f3f4f6] text-ink-500" },
];

function iconFor(event: AuditEvent) {
  const entry = actionIcons.find((item) => item.match(event.action, event.title)) ?? actionIcons[actionIcons.length - 1];
  const Icon = entry.icon;
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", entry.tone)}>
      <Icon className="size-4" />
    </span>
  );
}

function exportCsv(events: AuditEvent[]) {
  const header = "Title,Action,Detail,Timestamp\n";
  const body = events
    .map((e) => `"${e.title.replace(/"/g, '""')}","${e.action}","${e.detail.replace(/"/g, '""')}","${e.timestampUtc}"`)
    .join("\n");
  const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `platform-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AuditLogPage() {
  const { data, loading, error, reload } = useAsync(() => platformApi.listAudit(), []);
  const events = data?.items ?? [];

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Audit Log"]}
        title="Audit Log"
        subtitle="Every platform-level action, across every tenant, fully traceable"
        action={
          <button
            onClick={() => exportCsv(events)}
            disabled={events.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-900 hover:bg-[#f9fafb] disabled:opacity-50"
          >
            <Download className="size-3.5" />
            Export
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Events Today"
          value={auditKpis.eventsToday}
          icon={<ShieldCheck className="size-4" />}
          delta={<DeltaPill direction="up">{auditKpis.eventsDelta}</DeltaPill>}
        />
        <StatCard
          label="Active Staff"
          value={auditKpis.activeStaff}
          icon={<Users className="size-4" />}
          delta={<DeltaPill direction="up">{auditKpis.activeStaffDelta}</DeltaPill>}
        />
        <StatCard
          label="Tenant Actions"
          value={auditKpis.tenantActions}
          icon={<Building2 className="size-4" />}
          delta={<DeltaPill direction="up">{auditKpis.tenantActionsDelta}</DeltaPill>}
        />
        <StatCard
          label="Impersonation Events"
          value={auditKpis.impersonations}
          icon={<Clock className="size-4" />}
          delta={
            <DeltaPill direction="down" tone="danger">
              {auditKpis.impersonationsDelta}
            </DeltaPill>
          }
        />
      </div>

      <PanelCard className="mt-4" title="Platform Audit Log" icon={<ShieldCheck className="size-3.5" />}>
        {loading && <SkeletonTable rows={6} cols={3} />}
        {error && <ErrorState onRetry={reload} />}
        {!loading && !error && events.length === 0 && (
          <p className="py-6 text-center text-[12px] text-ink-500">No audit events yet. Platform actions will appear here.</p>
        )}
        {!loading &&
          !error &&
          events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 border-b border-[#f3f4f6] py-3 last:border-0">
              {iconFor(event)}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-ink-900">{event.title}</p>
                <p className="mt-0.5 text-[11px] text-ink-500">{event.detail}</p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-ink-500">{formatDateTime(event.timestampUtc)}</span>
            </div>
          ))}
      </PanelCard>
    </Page>
  );
}
