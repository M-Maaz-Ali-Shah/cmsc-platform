"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteSubscriber } from "@/app/actions/newsletter";
import type { schema } from "@/db/client";

type SubscriberRow = typeof schema.subscribers.$inferSelect;

export function SubscribersManager({ subscribers, canEdit }: { subscribers: SubscriberRow[]; canEdit: boolean }) {
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Subscribed</th>
            {canEdit && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {subscribers.map((s) => (
            <SubscriberRowItem key={s.id} subscriber={s} canEdit={canEdit} />
          ))}
          {subscribers.length === 0 && (
            <tr>
              <td colSpan={canEdit ? 4 : 3} className="px-4 py-10 text-center text-sm text-ink-500">
                No subscribers yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

function SubscriberRowItem({ subscriber, canEdit }: { subscriber: SubscriberRow; canEdit: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-b border-border-subtle last:border-0 hover:bg-paper-muted">
      <td className="px-4 py-3 font-medium text-navy-900">{subscriber.email}</td>
      <td className="px-4 py-3">
        <Badge variant={subscriber.confirmed ? "emerald" : "gold"}>
          {subscriber.confirmed ? "Confirmed" : "Pending"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-ink-500">
        {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(subscriber.createdAt)}
      </td>
      {canEdit && (
        <td className="px-4 py-3 text-right">
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            aria-label={`Remove ${subscriber.email}`}
            onClick={() => {
              if (confirm(`Remove ${subscriber.email} from the subscriber list?`)) {
                startTransition(() => deleteSubscriber(subscriber.id));
              }
            }}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </td>
      )}
    </tr>
  );
}
