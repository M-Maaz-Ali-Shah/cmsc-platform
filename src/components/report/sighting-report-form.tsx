"use client";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, ShieldAlert, UploadCloud } from "lucide-react";

import { Field, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { submitSightingReport } from "@/app/actions/sighting-reports";
import type { SightingReportFormState } from "@/lib/validation/sighting-report";

const countries = [
  "United Kingdom",
  "Ireland",
  "France",
  "Germany",
  "Belgium",
  "Netherlands",
  "Spain",
  "Italy",
  "Austria",
  "Other European country",
];

const directions = [
  "West",
  "West-Southwest",
  "Southwest",
  "West-Northwest",
  "Northwest",
];

const initialState: SightingReportFormState = undefined;

export function SightingReportForm() {
  const [moonObserved, setMoonObserved] = useState<"yes" | "no" | "">("");
  const formId = useId();
  const [state, formAction, pending] = useActionState(submitSightingReport, initialState);

  if (state?.success) {
    return <ConfirmationPanel referenceId={state.reportRef} />;
  }

  return (
    <form className="space-y-8" action={formAction}>
      {/* Honeypot — hidden from real visitors via CSS, not @type=hidden, so
          basic bots that only skip hidden inputs still fill it in. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Website</label>
        <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Card className="p-6 sm:p-9">
        <div className="space-y-8">
          <FieldSet
            legend="Observer Information"
            description="Basic details help reviewers verify your report."
          >
            <Field label="Full Name" htmlFor={`${formId}-name`} required className="sm:col-span-2">
              <Input id={`${formId}-name`} name="fullName" required autoComplete="name" />
            </Field>
            <Field label="Country" htmlFor={`${formId}-country`} required>
              <select
                id={`${formId}-country`}
                name="country"
                required
                defaultValue=""
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                <option value="" disabled>
                  Select country
                </option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="City / Town" htmlFor={`${formId}-city`} required>
              <Input id={`${formId}-city`} name="city" required autoComplete="address-level2" />
            </Field>
            <Field label="Region" htmlFor={`${formId}-region`} required hint="e.g. Scotland, Bavaria, Île-de-France">
              <Input id={`${formId}-region`} name="region" required />
            </Field>
            <Field label="Email" htmlFor={`${formId}-email`} required>
              <Input id={`${formId}-email`} type="email" name="email" required autoComplete="email" />
            </Field>
            <Field label="Phone (optional)" htmlFor={`${formId}-phone`}>
              <Input id={`${formId}-phone`} type="tel" name="phone" autoComplete="tel" />
            </Field>
          </FieldSet>

          <FieldSet
            legend="Observation Details"
            description="Tell us exactly what you observed, and when."
          >
            <Field label="Observation date" htmlFor={`${formId}-date`} required>
              <Input id={`${formId}-date`} type="date" name="observationDate" required />
            </Field>
            <Field label="Observation time" htmlFor={`${formId}-time`} required>
              <Input id={`${formId}-time`} type="time" name="observationTime" required />
            </Field>
            <Field
              label="Observation location"
              htmlFor={`${formId}-location`}
              required
              hint="Exact address, or a general description (e.g. 'Hilltop east of Leicester')"
              className="sm:col-span-2"
            >
              <Input id={`${formId}-location`} name="location" required />
            </Field>
            <Field label="Weather conditions" htmlFor={`${formId}-weather`} required>
              <select
                id={`${formId}-weather`}
                name="weather"
                required
                defaultValue=""
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                <option value="" disabled>
                  Select condition
                </option>
                <option>Clear</option>
                <option>Partly cloudy</option>
                <option>Cloudy</option>
                <option>Hazy</option>
                <option>Foggy</option>
                <option>Rain</option>
              </select>
            </Field>
            <Field label="Visibility conditions" htmlFor={`${formId}-visibility`} required>
              <select
                id={`${formId}-visibility`}
                name="visibility"
                required
                defaultValue=""
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                <option value="" disabled>
                  Select visibility
                </option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </Field>

            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-navy-900">
                Was the moon observed? <span className="text-emerald-700">*</span>
              </p>
              <div className="mt-2 flex gap-3">
                {(["yes", "no"] as const).map((v) => (
                  <label
                    key={v}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-border-subtle bg-paper px-4 py-2.5 text-sm font-medium text-ink-700 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-800"
                  >
                    <input
                      type="radio"
                      name="moonObserved"
                      value={v}
                      required
                      checked={moonObserved === v}
                      onChange={() => setMoonObserved(v)}
                      className="accent-emerald-700"
                    />
                    {v === "yes" ? "Yes" : "No"}
                  </label>
                ))}
              </div>
            </div>

            <Field label="Method of observation" htmlFor={`${formId}-method`} required>
              <select
                id={`${formId}-method`}
                name="method"
                required
                defaultValue=""
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                <option value="" disabled>
                  Select method
                </option>
                <option>Naked eye</option>
                <option>Optical aid (binoculars/telescope)</option>
                <option>Both</option>
              </select>
            </Field>
            <Field label="Direction observed" htmlFor={`${formId}-direction`}>
              <select
                id={`${formId}-direction`}
                name="direction"
                defaultValue=""
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                <option value="">Not sure / not applicable</option>
                {directions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Approximate altitude (optional)"
              htmlFor={`${formId}-altitude`}
              hint="In degrees above horizon, if known"
            >
              <Input id={`${formId}-altitude`} type="number" min={0} max={90} name="altitude" placeholder="e.g. 8" />
            </Field>
            <Field label="Observation duration" htmlFor={`${formId}-duration`} hint="Approximate minutes visible">
              <Input id={`${formId}-duration`} type="number" min={0} name="duration" placeholder="e.g. 5" />
            </Field>
          </FieldSet>

          <FieldSet legend="Additional Information">
            <Field
              label="Description"
              htmlFor={`${formId}-description`}
              hint="Anything else that would help reviewers — shape, brightness, obstructions, etc."
              className="sm:col-span-2"
            >
              <Textarea id={`${formId}-description`} name="description" rows={4} />
            </Field>
            <FileField
              id={`${formId}-photo`}
              label="Photograph (optional)"
              name="photo"
              accept="image/*"
            />
            <FileField
              id={`${formId}-evidence`}
              label="Supporting evidence (optional)"
              name="evidence"
              accept="image/*,.pdf"
              hint="Additional images or documents"
            />
          </FieldSet>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 border-emerald-700/20 bg-emerald-50 p-6 sm:flex-row sm:items-start">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden />
        <div>
          <label className="flex items-start gap-3 text-sm text-emerald-900">
            <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-emerald-700" />
            <span>
              I confirm that the information provided is truthful and
              accurate to the best of my knowledge.
            </span>
          </label>
          <p className="mt-3 text-xs text-emerald-800/80">
            Submission of a sighting report does not itself constitute an
            official moon-sighting declaration. Reports are reviewed by the
            committee before any decision is made.
          </p>
        </div>
      </Card>

      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" variant="emerald" disabled={pending}>
          {pending ? "Submitting…" : "Submit Sighting Report"}
        </Button>
      </div>
    </form>
  );
}

function FileField({
  id,
  label,
  name,
  accept,
  hint,
}: {
  id: string;
  label: string;
  name: string;
  accept: string;
  hint?: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <label
        htmlFor={id}
        className="flex h-11 cursor-pointer items-center gap-2 rounded-md border border-dashed border-border-subtle bg-paper px-3.5 text-sm text-ink-500 hover:bg-paper-muted"
      >
        <UploadCloud className="size-4 shrink-0 text-ink-300" aria-hidden />
        <span className="truncate">{fileName ?? "Choose a file…"}</span>
      </label>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
    </Field>
  );
}

function ConfirmationPanel({ referenceId }: { referenceId: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Card className="mx-auto max-w-2xl p-8 text-center sm:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="size-8" aria-hidden />
      </div>
      <h2 className="mt-6 font-heading text-2xl font-bold text-navy-900">
        Report Submitted
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
        Thank you for your observation. Your report has been received and
        will be reviewed by our team.
      </p>

      <div className="mx-auto mt-6 flex max-w-xs items-center justify-between gap-3 rounded-lg border border-border-subtle bg-paper-muted px-4 py-3">
        <div className="text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            Report ID
          </p>
          <p className="font-heading text-lg font-bold text-navy-900">{referenceId}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(referenceId).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle text-ink-500 hover:bg-surface"
          aria-label="Copy report ID"
        >
          <Copy className="size-4" />
        </button>
      </div>
      {copied && <p className="mt-2 text-xs font-medium text-emerald-700">Copied to clipboard</p>}

      <div className="mx-auto mt-8 max-w-md rounded-lg bg-navy-50 p-4 text-left text-xs leading-relaxed text-navy-800">
        Submission of a sighting report does not itself constitute an
        official moon-sighting declaration. You can track the committee&rsquo;s
        overall review progress on the{" "}
        <Link href="/moon-sighting" className="font-semibold underline underline-offset-2">
          Moon Sighting status page
        </Link>
        .
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild variant="outline">
          <Link href="/">Return to homepage</Link>
        </Button>
        <Button asChild>
          <Link href="/moon-sighting">View sighting status</Link>
        </Button>
      </div>
    </Card>
  );
}
