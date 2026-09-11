"use client";

import { useTransition } from "react";
import { Mail, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setContactMessageRead, deleteContactMessage } from "@/app/actions/contact";
import type { schema } from "@/db/client";

type ContactMessageRow = typeof schema.contactMessages.$inferSelect;

export function ContactMessagesManager({ messages, canEdit }: { messages: ContactMessageRow[]; canEdit: boolean }) {
  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-ink-500">
        Messages submitted through the public Contact page.
      </p>
      {messages.map((m) => (
        <MessageCard key={m.id} message={m} canEdit={canEdit} />
      ))}
      {messages.length === 0 && (
        <Card className="p-8 text-center text-sm text-ink-500">No messages yet.</Card>
      )}
    </div>
  );
}

function MessageCard({ message, canEdit }: { message: ContactMessageRow; canEdit: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className={`p-5 ${message.isRead ? "" : "border-l-4 border-l-emerald-600"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-base font-bold text-navy-900">{message.subject}</p>
            {!message.isRead && <Badge variant="emerald">New</Badge>}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
            <Mail className="size-3.5" aria-hidden />
            {message.name} &middot; {message.email}
          </p>
        </div>
        <p className="text-xs text-ink-400">
          {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(message.createdAt)}
        </p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-700">{message.message}</p>
      {canEdit && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => startTransition(() => setContactMessageRead(message.id, !message.isRead))}
          >
            {message.isRead ? "Mark unread" : "Mark read"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            aria-label={`Delete message from ${message.name}`}
            onClick={() => {
              if (confirm("Delete this message?")) startTransition(() => deleteContactMessage(message.id));
            }}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
          <Button asChild size="sm">
            <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}>Reply</a>
          </Button>
        </div>
      )}
    </Card>
  );
}
