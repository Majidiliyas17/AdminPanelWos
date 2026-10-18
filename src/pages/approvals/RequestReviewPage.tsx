import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Clock, FileText, Globe, ShieldCheck, StickyNote } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/shell";
import { Button, DeltaPill, ErrorState, Modal, PanelCard, Skeleton, StatCard } from "@/components/ui";
import { platformApi } from "@/lib/platformApi";
import { useAsync } from "@/lib/useAsync";
import { describeApiError } from "@/lib/api";
import { toast } from "@/lib/toast";
import { formatDateTime, hoursSince } from "@/lib/time";

export function RequestReviewPage() {
  const { requestId = "" } = useParams();
  const navigate = useNavigate();
  const { data: request, loading, error, reload } = useAsync(() => platformApi.getRequest(requestId), [requestId]);
  const [notes, setNotes] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <Page>
        <Skeleton className="mb-4 h-14" />
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[110px]" />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </Page>
    );
  }

  if (error || !request) {
    return (
      <Page>
        <ErrorState onRetry={reload} title="Couldn't load this request" description={describeApiError(error)} />
      </Page>
    );
  }

  const queueHours = hoursSince(request.submittedAtUtc);

  async function onApprove() {
    setBusy(true);
    try {
      await platformApi.approveRequest(request!.id);
      toast.success("Request approved", `${request!.companyName} is being provisioned.`);
      navigate(`/approvals/${request!.id}/provision`);
    } catch {
      // toast already shown by platformApi
    } finally {
      setBusy(false);
    }
  }

  async function onReject() {
    setBusy(true);
    try {
      await platformApi.rejectRequest(request!.id, rejectNote || undefined);
      toast.success("Request rejected", `${request!.companyName} has been rejected.`);
      setRejectOpen(false);
      navigate("/approvals");
    } catch {
      // toast already shown by platformApi
    } finally {
      setBusy(false);
    }
  }

  const detailRows: Array<[string, string]> = [
    ["Company Name", request.companyName],
    ["Country", request.country],
    ["Warehouse Type", request.warehouseType],
    ["Requested Plan", request.requestedPlan],
    ["Contact", request.contactName],
    ["Email", request.email],
    ["Submitted", formatDateTime(request.submittedAtUtc)],
    ["Status", request.status],
  ];

  return (
    <Page>
      <PageHeader
        breadcrumb={["WarehouseOS", "Platform Console", "Approvals", "Request"]}
        title={request.companyName}
        subtitle="Reviewing new tenant application"
        action={
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
            <Button onClick={onApprove} disabled={busy}>
              {busy ? "Working…" : "✓ Approve & Provision"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Current Status"
          value={request.status}
          icon={<ShieldCheck className="size-4" />}
          delta={<DeltaPill direction="up">{request.status === "Pending" ? "awaiting decision" : "reviewed"}</DeltaPill>}
        />
        <StatCard
          label="Time in Queue"
          value={
            <>
              {queueHours}
              <span className="ml-1 text-[11px] font-medium text-ink-500">hrs</span>
            </>
          }
          icon={<Clock className="size-4" />}
          delta={<DeltaPill direction="up">since submission</DeltaPill>}
        />
        <StatCard
          label="Requested Plan"
          value={request.requestedPlan}
          icon={<FileText className="size-4" />}
          delta={<DeltaPill direction="up">as requested</DeltaPill>}
        />
        <StatCard
          label="Country"
          value={request.country}
          icon={<Globe className="size-4" />}
          delta={<DeltaPill direction="up">{request.warehouseType}</DeltaPill>}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 items-start gap-4">
        <PanelCard title="Application Details" icon={<FileText className="size-3.5" />}>
          <dl>
            {detailRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-[#f3f4f6] py-2.5 last:border-0">
                <dt className="text-[12px] text-ink-500">{label}</dt>
                <dd className={`text-[12px] font-semibold text-ink-900 ${label === "Email" ? "font-mono" : ""}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </PanelCard>

        <div className="space-y-4">
          <PanelCard title="Verification" icon={<ShieldCheck className="size-3.5" />}>
            <p className="text-[12px] leading-relaxed text-ink-500">
              Backend verification results abhi is request ke saath nahi aa rahe. Admin console yahan status "not run"
              dikhata hai — green tick tabhi aayenge jab backend verification endpoint is data ko bhejega.
            </p>
          </PanelCard>

          <PanelCard title="Internal Notes" icon={<StickyNote className="size-3.5" />}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add an internal note before deciding (visible to platform team only)…"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] outline-none focus:border-primary"
            />
          </PanelCard>
        </div>
      </div>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)}>
        <h3 className="text-[16px] font-bold text-ink-900">Reject {request.companyName}?</h3>
        <p className="mt-1 text-[12px] text-ink-500">
          The applicant will be marked as rejected. Add an optional note for the audit trail.
        </p>
        <label className="mt-4 block text-[11px] font-semibold text-[#374151]">
          Note (optional)
          <textarea
            rows={3}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="e.g. Incomplete business registration…"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-[12px] outline-none focus:border-primary"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRejectOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onReject} disabled={busy}>
            Reject Request
          </Button>
        </div>
      </Modal>

      <p className="mt-4 text-[11px] text-ink-500">
        <Link to="/approvals" className="font-semibold text-primary hover:underline">
          ← Back to approval queue
        </Link>
      </p>
    </Page>
  );
}
