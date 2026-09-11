"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Eye, FileText, MapPin, Telescope, User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReportStatusBadge } from "@/components/admin/report-status-badge";
import {
  REPORT_STATUSES,
  type ReportStatus,
  type ReportNoteRow,
  type SightingReportRow,
} from "@/lib/types/reports";
import { updateReportStatus, assignReviewer, addReportNote } from "@/app/actions/sighting-reports";

interface ReviewerOption {
  id: string;
  name: string;
  role: string;
}

export function ReportDetailPanel({
  report,
  notes: initialNotes,
  reviewers,
  currentUserName,
  canEdit,
}: {
  report: SightingReportRow;
  notes: ReportNoteRow[];
  reviewers: ReviewerOption[];
  currentUserName: string;
  canEdit: boolean;
}) {
  const [status, setStatus] = useState<ReportStatus>(report.status as ReportStatus);
  const [reviewerId, setReviewerId] = useState<string>(report.reviewerId ?? "");
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleStatusChange(next: ReportStatus) {
    const previous = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      try {
        await updateReportStatus(report.reportRef, next);
      } catch {
        setStatus(previous);
        setError("Could not update status. Try again.");
      }
    });
  }

  function handleReviewerChange(next: string) {
    const previous = reviewerId;
    setReviewerId(next);
    setError(null);
    startTransition(async () => {
      try {
        await assignReviewer(report.reportRef, next || null);
      } catch {
        setReviewerId(previous);
        setError("Could not assign reviewer. Try again.");
      }
    });
  }

  function handleAddNote() {
    const text = draft.trim();
    if (!text) return;
    setError(null);
    startTransition(async () => {
      try {
        await addReportNote(report.reportRef, text);
        setNotes((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            reportId: report.id,
            authorName: currentUserName,
            note: text,
            createdAt: new Date(),
          },
        ]);
        setDraft("");
      } catch {
        setError("Could not add note. Try again.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-heading text-lg font-bold text-navy-900">{report.reportRef}</p>
              <p className="text-xs text-ink-500">
                Submitted {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(report.submittedAt)}
              </p>
            </div>
            <ReportStatusBadge status={status} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoRow icon={User} label="Observer" value={report.observerName} />
            <InfoRow icon={MapPin} label="Location" value={`${report.city}, ${report.country}`} />
            <InfoRow icon={Eye} label="Moon observed" value={report.moonObserved ? "Yes" : "No"} />
            <InfoRow icon={Telescope} label="Method" value={report.method} />
            <InfoRow icon={Telescope} label="Weather" value={report.weather} />
            <InfoRow icon={Telescope} label="Visibility" value={report.visibility} />
            <InfoRow icon={User} label="Contact email" value={report.email} />
            {report.phone && <InfoRow icon={User} label="Phone" value={report.phone} />}
          </div>

          {report.description && (
            <div className="mt-6 border-t border-border-subtle pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Description</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{report.description}</p>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {report.photoKey ? (
              <a
                href={`/api/files/${report.photoKey}`}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg border border-border-subtle"
              >
                <Image
                  src={`/api/files/${report.photoKey}`}
                  alt="Submitted photograph"
                  width={400}
                  height={260}
                  unoptimized
                  className="h-40 w-full object-cover"
                />
                <span className="block bg-paper-muted px-3 py-1.5 text-xs font-medium text-ink-600">
                  View full photograph
                </span>
              </a>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border-subtle text-center text-xs text-ink-500">
                No photograph uploaded.
              </div>
            )}
            {report.evidenceKey ? (
              <a
                href={`/api/files/${report.evidenceKey}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-border-subtle bg-paper-muted text-sm font-medium text-navy-800 hover:bg-paper"
              >
                <FileText className="size-8 text-navy-600" aria-hidden />
                View supporting evidence
              </a>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border-subtle text-center text-xs text-ink-500">
                No supporting evidence uploaded.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <p className="font-heading text-base font-bold text-navy-900">Internal Notes</p>
          <p className="text-xs text-ink-500">Visible to reviewers and committee admins only — never public.</p>
          <ul className="mt-4 space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-lg bg-paper-muted p-3 text-sm">
                <p className="text-ink-700">{n.note}</p>
                <p className="mt-1 text-xs text-ink-400">
                  {n.authorName} &middot;{" "}
                  {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(n.createdAt)}
                </p>
              </li>
            ))}
            {notes.length === 0 && <p className="text-sm text-ink-400">No notes yet.</p>}
          </ul>
          {canEdit && (
            <div className="mt-4 space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add an internal note…"
                rows={3}
              />
              <Button size="sm" variant="outline" disabled={!draft.trim() || pending} onClick={handleAddNote}>
                Add Note
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <p className="font-heading text-base font-bold text-navy-900">Workflow</p>
          {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Status</label>
              <select
                value={status}
                disabled={!canEdit || pending}
                onChange={(e) => handleStatusChange(e.target.value as ReportStatus)}
                className="mt-1.5 h-10 w-full rounded-md border border-border-subtle bg-paper px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold-600 disabled:opacity-60"
              >
                {REPORT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Assigned reviewer</label>
              <select
                value={reviewerId}
                disabled={!canEdit || pending}
                onChange={(e) => handleReviewerChange(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-md border border-border-subtle bg-paper px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold-600 disabled:opacity-60"
              >
                <option value="">Unassigned</option>
                {reviewers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {canEdit && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="emerald" size="sm" disabled={pending} onClick={() => handleStatusChange("Accepted")}>
                Accept
              </Button>
              <Button variant="outline" size="sm" disabled={pending} onClick={() => handleStatusChange("Rejected")}>
                Reject
              </Button>
              <Button variant="outline" size="sm" disabled={pending} onClick={() => handleStatusChange("Contact Verification")}>
                Verify Contact
              </Button>
              <Button size="sm" disabled={pending} onClick={() => handleStatusChange("Included in Decision")}>
                Include in Decision
              </Button>
            </div>
          )}
          {!canEdit && (
            <p className="mt-4 text-xs text-ink-400">
              Your role has view-only access to sighting reports.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-emerald-700" />
      <div>
        <p className="text-xs text-ink-500">{label}</p>
        <p className="text-sm font-medium text-navy-900">{value}</p>
      </div>
    </div>
  );
}
