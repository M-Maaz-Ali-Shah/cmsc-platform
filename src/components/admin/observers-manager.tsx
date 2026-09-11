"use client";

import { useTransition } from "react";
import { Mail, UserRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateTeamAccountForm } from "@/components/admin/create-team-account-form";
import { setUserActive } from "@/app/actions/team";

export interface ObserverAccount {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: Date;
  regionName: string | null;
}

export function ObserversManager({ observers, canEdit }: { observers: ObserverAccount[]; canEdit: boolean }) {
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-ink-500">
        Observer accounts have dashboard access to submit and view sighting
        report context, without administrative privileges. This is separate
        from the public sighting-report form, which anyone can use without
        an account.
      </p>

      {canEdit && <CreateTeamAccountForm role="observer" label="New Observer Account" />}

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Region</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              {canEdit && <th className="px-4 py-3 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {observers.map((o) => (
              <ObserverRow key={o.id} observer={o} canEdit={canEdit} />
            ))}
            {observers.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 6 : 5} className="px-4 py-10 text-center text-sm text-ink-500">
                  No observer accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function ObserverRow({ observer, canEdit }: { observer: ObserverAccount; canEdit: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-b border-border-subtle last:border-0 hover:bg-paper-muted">
      <td className="px-4 py-3 font-semibold text-navy-900">
        <span className="flex items-center gap-1.5">
          <UserRound className="size-3.5 text-ink-300" aria-hidden />
          {observer.name}
        </span>
      </td>
      <td className="px-4 py-3 text-ink-700">
        <span className="flex items-center gap-1.5">
          <Mail className="size-3.5 text-ink-300" aria-hidden />
          {observer.email}
        </span>
      </td>
      <td className="px-4 py-3 text-ink-500">{observer.regionName ?? "—"}</td>
      <td className="px-4 py-3 text-ink-500">
        {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(observer.createdAt)}
      </td>
      <td className="px-4 py-3">
        <Badge variant={observer.active ? "emerald" : "neutral"}>{observer.active ? "Active" : "Deactivated"}</Badge>
      </td>
      {canEdit && (
        <td className="px-4 py-3">
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => startTransition(() => setUserActive(observer.id, !observer.active))}
          >
            {observer.active ? "Deactivate" : "Reactivate"}
          </Button>
        </td>
      )}
    </tr>
  );
}
