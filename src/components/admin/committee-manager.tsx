"use client";

import { useActionState, useState, useTransition } from "react";
import { Trash2, UserRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createCommitteeMember,
  setCommitteeMemberApproved,
  deleteCommitteeMember,
} from "@/app/actions/committee";
import type { CommitteeMemberFormState } from "@/lib/validation/committee-member";
import type { schema } from "@/db/client";

type CommitteeMemberRow = typeof schema.committeeMembers.$inferSelect;

const initialState: CommitteeMemberFormState = undefined;

export function CommitteeManager({ members, canEdit }: { members: CommitteeMemberRow[]; canEdit: boolean }) {
  const [composing, setComposing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(createCommitteeMember, initialState);

  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (!state?.error && composing) {
      // No error means the submit went through (create actions return
      // undefined on success) — close and reset the composer.
      setComposing(false);
      setFormKey((k) => k + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-ink-500">
          Manage committee member profiles shown on the public Committee
          page — nothing appears publicly until approved here.
        </p>
        {canEdit && (
          <Button onClick={() => setComposing((v) => !v)}>{composing ? "Close" : "Add Member"}</Button>
        )}
      </div>

      {composing && canEdit && (
        <Card className="p-6">
          <form key={formKey} action={formAction} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="cm-name" required>
              <Input id="cm-name" name="name" required />
            </Field>
            <Field label="Role / title" htmlFor="cm-role" required hint="e.g. Chair, Astronomical Adviser">
              <Input id="cm-role" name="role" required />
            </Field>
            <Field label="Region" htmlFor="cm-region" required>
              <Input id="cm-region" name="region" required />
            </Field>
            <Field label="Photo (optional)" htmlFor="cm-photo">
              <input
                id="cm-photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
              />
            </Field>
            <Field label="Biography (optional)" htmlFor="cm-bio" className="sm:col-span-2">
              <Textarea id="cm-bio" name="bio" rows={3} />
            </Field>
            {state?.error && (
              <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {state.error}
              </p>
            )}
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Add Member"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} canEdit={canEdit} />
        ))}
        {members.length === 0 && (
          <p className="col-span-full text-sm text-ink-400">No committee member profiles yet.</p>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member, canEdit }: { member: CommitteeMemberRow; canEdit: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="p-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-navy-50 text-navy-400">
        {member.photoKey ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/files/${member.photoKey}`} alt={member.name} className="h-full w-full object-cover" />
        ) : (
          <UserRound className="size-8" aria-hidden />
        )}
      </div>
      <p className="mt-3 font-heading text-sm font-bold text-navy-900">{member.name}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">{member.role}</p>
      <p className="mt-1 text-xs text-ink-500">{member.region}</p>
      <Badge variant={member.approved ? "emerald" : "neutral"} className="mt-3">
        {member.approved ? "Published" : "Hidden"}
      </Badge>
      {canEdit && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => startTransition(() => setCommitteeMemberApproved(member.id, !member.approved))}
          >
            {member.approved ? "Hide" : "Publish"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => {
              if (confirm(`Remove ${member.name} from the committee list?`)) {
                startTransition(() => deleteCommitteeMember(member.id));
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
