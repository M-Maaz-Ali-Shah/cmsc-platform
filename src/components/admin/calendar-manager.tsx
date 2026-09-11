"use client";

import { useActionState, useState, useTransition } from "react";
import { CalendarDays, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createCalendarEntry,
  updateCalendarEntryStatus,
  deleteCalendarEntry,
} from "@/app/actions/calendar";
import { OFFICIAL_STATUSES, type CalendarEntryFormState } from "@/lib/validation/calendar-entry";
import type { schema } from "@/db/client";

type CalendarEntryRow = typeof schema.calendarEntries.$inferSelect;

const statusBadge: Record<string, "published" | "sighted" | "awaiting" | "review" | "notSighted"> = {
  Announced: "published",
  Sighted: "sighted",
  "Current Month": "awaiting",
  "Under Review": "review",
  Upcoming: "notSighted",
};

const initialState: CalendarEntryFormState = undefined;

export function CalendarManager({
  entries,
  announcementSlugs,
  canEdit,
}: {
  entries: CalendarEntryRow[];
  announcementSlugs: string[];
  canEdit: boolean;
}) {
  const [composing, setComposing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(createCalendarEntry, initialState);

  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (!state?.error && composing) {
      setComposing(false);
      setFormKey((k) => k + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-ink-500">
          Manage calendar entries — astronomical estimates and official
          confirmations — that power the public calendar page.
        </p>
        {canEdit && (
          <Button onClick={() => setComposing((v) => !v)}>{composing ? "Close" : "Add Month"}</Button>
        )}
      </div>

      {composing && canEdit && (
        <Card className="p-6">
          <form key={formKey} action={formAction} className="grid gap-4 sm:grid-cols-2">
            <Field label="Hijri month" htmlFor="ce-month" required>
              <Input id="ce-month" name="hijriMonth" placeholder="e.g. Shawwal" required />
            </Field>
            <Field label="Hijri year" htmlFor="ce-year" required>
              <Input id="ce-year" name="hijriYear" placeholder="e.g. 1448 AH" required />
            </Field>
            <Field label="Astronomical estimate (optional)" htmlFor="ce-estimate" hint="Informational only.">
              <Input id="ce-estimate" name="astronomicalEstimate" placeholder="e.g. 25 Mar 2026" />
            </Field>
            <Field label="Status" htmlFor="ce-status" required>
              <select
                id="ce-status"
                name="officialStatus"
                required
                defaultValue="Upcoming"
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                {OFFICIAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Official date (optional)" htmlFor="ce-date">
              <Input id="ce-date" name="officialDate" placeholder="e.g. 25 Mar 2026" />
            </Field>
            <Field label="Linked announcement (optional)" htmlFor="ce-slug">
              <select
                id="ce-slug"
                name="announcementSlug"
                defaultValue=""
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                <option value="">None yet</option>
                {announcementSlugs.map((slug) => (
                  <option key={slug} value={slug}>
                    {slug}
                  </option>
                ))}
              </select>
            </Field>
            {state?.error && (
              <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {state.error}
              </p>
            )}
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Add Month"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((e) => (
          <EntryCard key={e.id} entry={e} canEdit={canEdit} />
        ))}
        {entries.length === 0 && <p className="col-span-full text-sm text-ink-400">No calendar entries yet.</p>}
      </div>
    </div>
  );
}

function EntryCard({ entry, canEdit }: { entry: CalendarEntryRow; canEdit: boolean }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(entry.officialStatus);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-heading text-base font-bold text-navy-900">
          <CalendarDays className="size-4 text-emerald-700" aria-hidden />
          {entry.hijriMonth}
        </p>
        <Badge variant={statusBadge[status] ?? "neutral"}>{status}</Badge>
      </div>
      <p className="mt-1 text-xs text-ink-500">{entry.hijriYear}</p>
      {entry.astronomicalEstimate && (
        <p className="mt-2 text-xs text-ink-500">Estimate: {entry.astronomicalEstimate}</p>
      )}
      {entry.officialDate && <p className="mt-1 text-xs text-ink-500">Confirmed: {entry.officialDate}</p>}

      {canEdit && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={status}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.value;
              setStatus(next);
              startTransition(() => updateCalendarEntryStatus(entry.id, next, entry.officialDate));
            }}
            className="h-9 rounded-md border border-border-subtle bg-paper px-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
          >
            {OFFICIAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => {
              if (confirm(`Remove ${entry.hijriMonth} ${entry.hijriYear} from the calendar?`)) {
                startTransition(() => deleteCalendarEntry(entry.id));
              }
            }}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </div>
      )}
    </Card>
  );
}
