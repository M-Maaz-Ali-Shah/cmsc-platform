"use client";

import { useActionState, useState } from "react";
import { Copy, KeyRound } from "lucide-react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createTeamAccount } from "@/app/actions/team";
import type { CreateTeamAccountState, TeamRole } from "@/lib/validation/team";

const initialState: CreateTeamAccountState = undefined;

interface RegionOption {
  id: string;
  name: string;
}

export function CreateTeamAccountForm({
  role,
  regions,
  label,
}: {
  role: TeamRole;
  regions?: RegionOption[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTeamAccount, initialState);
  const [copied, setCopied] = useState(false);

  if (state && "success" in state && state.success) {
    return (
      <Card className="border-emerald-700/20 bg-emerald-50 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <KeyRound className="size-4" aria-hidden />
          Account created for {state.email}
        </p>
        <p className="mt-2 text-xs text-emerald-800">
          Share this temporary password with them securely — it will not be shown again.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="rounded-md border border-emerald-700/20 bg-white px-3 py-2 text-sm font-semibold text-navy-900">
            {state.tempPassword}
          </code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(state.tempPassword).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-emerald-700/20 bg-white text-emerald-800 hover:bg-emerald-50"
            aria-label="Copy password"
          >
            <Copy className="size-4" />
          </button>
        </div>
        {copied && <p className="mt-1 text-xs font-medium text-emerald-700">Copied</p>}
        <Button size="sm" variant="outline" className="mt-4" onClick={() => setOpen(false)}>
          Done
        </Button>
      </Card>
    );
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <form action={formAction} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="role" value={role} />
        <Field label="Full name" htmlFor={`team-name-${role}`} required>
          <Input id={`team-name-${role}`} name="name" required />
        </Field>
        <Field label="Email address" htmlFor={`team-email-${role}`} required>
          <Input id={`team-email-${role}`} name="email" type="email" required />
        </Field>
        {regions && (
          <Field label="Region" htmlFor={`team-region-${role}`} className="sm:col-span-2">
            <select
              id={`team-region-${role}`}
              name="regionId"
              defaultValue=""
              className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
            >
              <option value="">No region assigned yet</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {state && "error" in state && state.error && (
          <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {state.error}
          </p>
        )}
        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
