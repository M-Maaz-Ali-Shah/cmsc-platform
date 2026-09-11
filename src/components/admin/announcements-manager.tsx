"use client";

import { useActionState, useState, useTransition } from "react";
import { CheckCircle2, Circle, FileEdit, ScrollText, ShieldCheck, Send } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement, advanceAnnouncementStatus } from "@/app/actions/announcements";
import type { AnnouncementFormState } from "@/lib/validation/announcement";
import {
  ANNOUNCEMENT_STAGES,
  ANNOUNCEMENT_TYPES,
  PUBLIC_STATUSES,
  type AnnouncementRow,
  type AnnouncementStage,
} from "@/lib/types/announcements";

const stageIcons = {
  Draft: FileEdit,
  "Under Review": ScrollText,
  "Pending Approval": ShieldCheck,
  Approved: CheckCircle2,
  Published: Send,
};

const stageBadge: Record<AnnouncementStage, "neutral" | "review" | "awaiting" | "confirmed" | "published"> = {
  Draft: "neutral",
  "Under Review": "review",
  "Pending Approval": "awaiting",
  Approved: "confirmed",
  Published: "published",
};

const initialState: AnnouncementFormState = undefined;

export function AnnouncementsManager({ announcements, canEdit }: { announcements: AnnouncementRow[]; canEdit: boolean }) {
  const [composing, setComposing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(createAnnouncement, initialState);

  // Adjust state during render (rather than in an effect) when the action
  // just succeeded — see https://react.dev/learn/you-might-not-need-an-effect
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.success) {
      setComposing(false);
      setFormKey((k) => k + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-ink-500">
          Announcements move through a controlled workflow: drafted, reviewed,
          approved by an authorised committee administrator, then published —
          publishing emails everyone on the subscriber list.
        </p>
        {canEdit && (
          <Button onClick={() => setComposing((v) => !v)}>
            {composing ? "Close" : "New Announcement"}
          </Button>
        )}
      </div>

      {composing && canEdit && (
        <Card className="p-6 sm:p-7">
          <p className="font-heading text-base font-bold text-navy-900">Compose Announcement</p>
          <form key={formKey} className="mt-5 grid gap-4 sm:grid-cols-2" action={formAction}>
            <Field label="Islamic month" htmlFor="an-month" required>
              <Input id="an-month" name="month" placeholder="e.g. Shawwal" required />
            </Field>
            <Field label="Hijri year" htmlFor="an-year" required>
              <Input id="an-year" name="hijriYear" placeholder="e.g. 1448 AH" required />
            </Field>
            <Field label="Gregorian year" htmlFor="an-gyear" required>
              <Input id="an-gyear" name="gregorianYear" placeholder="e.g. 2026" required />
            </Field>
            <Field label="Region" htmlFor="an-region" required>
              <Input id="an-region" name="region" defaultValue="Great Britain & Europe" required />
            </Field>
            <Field label="Type" htmlFor="an-type" required>
              <select
                id="an-type"
                name="type"
                required
                defaultValue="Month Start"
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                {ANNOUNCEMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Public status badge" htmlFor="an-pstatus" required>
              <select
                id="an-pstatus"
                name="publicStatus"
                required
                defaultValue="Confirmed"
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                {PUBLIC_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Decision headline" htmlFor="an-decision" required className="sm:col-span-2">
              <Input id="an-decision" name="decision" placeholder="e.g. Crescent sighted — Shawwal begins…" required />
            </Field>
            <Field label="Short summary" htmlFor="an-summary" required className="sm:col-span-2" hint="Shown in the public archive list.">
              <Textarea id="an-summary" name="summary" rows={2} required />
            </Field>
            <Field label="Official statement" htmlFor="an-statement" required className="sm:col-span-2">
              <Textarea id="an-statement" name="statement" rows={5} required />
            </Field>
            <Field label="PDF attachment (optional)" htmlFor="an-pdf" className="sm:col-span-2" hint="Publicly downloadable once published.">
              <input
                id="an-pdf"
                name="pdf"
                type="file"
                accept="application/pdf"
                className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
              />
            </Field>

            {state?.error && (
              <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {state.error}
              </p>
            )}

            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save as Draft"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {announcements.map((item) => (
          <AnnouncementCard key={item.id} item={item} canEdit={canEdit} />
        ))}
        {announcements.length === 0 && (
          <Card className="p-8 text-center text-sm text-ink-500">
            No announcements yet. {canEdit && "Create the first one above."}
          </Card>
        )}
      </div>
    </div>
  );
}

function AnnouncementCard({ item, canEdit }: { item: AnnouncementRow; canEdit: boolean }) {
  const [pending, startTransition] = useTransition();
  const stage = item.status as AnnouncementStage;
  const currentIdx = ANNOUNCEMENT_STAGES.indexOf(stage);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-heading text-base font-bold text-navy-900">
            {item.month} {item.hijriYear} — {item.decision}
          </p>
          <p className="text-xs text-ink-500">
            Prepared by {item.createdByName} &middot; updated{" "}
            {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(item.updatedAt)}
          </p>
        </div>
        <Badge variant={stageBadge[stage]}>{stage}</Badge>
      </div>

      <ol className="mt-5 flex flex-wrap items-center gap-2">
        {ANNOUNCEMENT_STAGES.map((s, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          const Icon = stageIcons[s];
          return (
            <li key={s} className="flex items-center gap-2">
              <span
                className={
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold " +
                  (current
                    ? "bg-gold-500 text-navy-950"
                    : done
                    ? "bg-emerald-700 text-white"
                    : "bg-paper-muted text-ink-400")
                }
              >
                {done ? <CheckCircle2 className="size-3.5" /> : <Icon className="size-3.5" />}
                {s}
              </span>
              {i < ANNOUNCEMENT_STAGES.length - 1 && (
                <Circle className="size-1.5 fill-ink-300 text-ink-300" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      {canEdit && stage !== "Published" && (
        <div className="mt-5">
          <Button
            size="sm"
            disabled={pending}
            onClick={() => startTransition(() => advanceAnnouncementStatus(item.id))}
          >
            {pending ? "Working…" : `Advance to ${ANNOUNCEMENT_STAGES[currentIdx + 1]}`}
          </Button>
        </div>
      )}
    </Card>
  );
}
