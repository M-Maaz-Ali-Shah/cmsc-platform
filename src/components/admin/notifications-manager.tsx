"use client";

import { useActionState } from "react";
import { BellRing, Clock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateNotificationSettings } from "@/app/actions/notifications";
import type { NotificationLogEntry } from "@/app/actions/notifications";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_DESCRIPTIONS,
  type NotificationSettings,
} from "@/lib/validation/notifications";

const STATUS_VARIANT: Record<string, "emerald" | "gold" | "neutral"> = {
  sent: "emerald",
  failed: "gold",
  skipped: "neutral",
};

export function NotificationsManager({
  settings,
  log,
  canEdit,
}: {
  settings: NotificationSettings;
  log: NotificationLogEntry[];
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateNotificationSettings, undefined);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <BellRing className="mt-0.5 size-5 text-emerald-700" aria-hidden />
        <div>
          <p className="font-heading text-base font-bold text-navy-900">Notifications</p>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Control which automated emails this app sends, and see a log of
            what was actually sent (or skipped/failed) — never the message
            content itself.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <form action={formAction} className="space-y-4">
          <label className="flex items-start gap-3 rounded-lg border border-border-subtle bg-paper-muted p-4">
            <input
              type="checkbox"
              name="masterEnabled"
              defaultChecked={settings.masterEnabled}
              disabled={!canEdit}
              className="mt-0.5 size-4"
            />
            <span>
              <span className="block text-sm font-semibold text-navy-900">Email notifications</span>
              <span className="block text-xs text-ink-500">
                Master switch. When off, no notification email is sent regardless of the toggles below.
              </span>
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {NOTIFICATION_TYPES.map((type) => (
              <label key={type} className="flex items-start gap-3 rounded-lg border border-border-subtle p-4">
                <input
                  type="checkbox"
                  name={type}
                  defaultChecked={settings[type]}
                  disabled={!canEdit}
                  className="mt-0.5 size-4"
                />
                <span>
                  <span className="block text-sm font-semibold text-navy-900">
                    {NOTIFICATION_TYPE_LABELS[type]}
                  </span>
                  <span className="block text-xs text-ink-500">{NOTIFICATION_TYPE_DESCRIPTIONS[type]}</span>
                </span>
              </label>
            ))}
          </div>

          {state && "error" in state && state.error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {state.error}
            </p>
          )}
          {state && "success" in state && state.success && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              Notification settings saved.
            </p>
          )}

          {canEdit && (
            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save Settings"}
              </Button>
            </div>
          )}
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-navy-400" aria-hidden />
          <p className="font-heading text-sm font-bold text-navy-900">Recent Notification Activity</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-xs uppercase tracking-wide text-ink-500">
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Recipient</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Related</th>
                <th className="pb-2">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {log.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-2.5 pr-4 text-ink-700">
                    {NOTIFICATION_TYPE_LABELS[entry.type as keyof typeof NOTIFICATION_TYPE_LABELS] ?? entry.type}
                  </td>
                  <td className="py-2.5 pr-4 text-ink-700">{entry.recipient}</td>
                  <td className="py-2.5 pr-4">
                    <Badge variant={STATUS_VARIANT[entry.status] ?? "neutral"}>{entry.status}</Badge>
                    {entry.failureReason && (
                      <span className="ml-2 text-xs text-ink-400" title={entry.failureReason}>
                        ({entry.failureReason})
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-ink-500">{entry.relatedEntity ?? "—"}</td>
                  <td className="py-2.5 text-ink-500">
                    {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
                      entry.createdAt
                    )}
                  </td>
                </tr>
              ))}
              {log.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-ink-400">
                    No notifications have been sent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
