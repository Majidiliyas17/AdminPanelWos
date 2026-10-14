import { Page, PageHeader } from "@/components/layout/shell";
import { EmptyState } from "@/components/ui";

export function Placeholder({
  breadcrumb,
  title,
  subtitle,
  milestone,
  actionLabel,
}: {
  breadcrumb: string[];
  title: string;
  subtitle?: string;
  milestone: string;
  actionLabel?: string;
}) {
  return (
    <Page>
      <PageHeader
        breadcrumb={breadcrumb}
        title={title}
        subtitle={subtitle}
        action={
          actionLabel ? (
            <button className="rounded-lg bg-primary px-3.5 py-2 text-[13px] font-semibold text-white">{actionLabel}</button>
          ) : undefined
        }
      />
      <EmptyState
        title={`${title} — console screen pending`}
        description={`Planned in milestone ${milestone}. Phase 6 PDF data will be wired to the Platform API here.`}
      />
    </Page>
  );
}
