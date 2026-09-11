"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { FileText } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getContentBlockForEdit,
  saveContentDraft,
  publishContentBlock,
  type ContentBlockSummary,
} from "@/app/actions/content";
import type { ContentBlockId, ContentSaveFormState } from "@/lib/validation/content";

const STATUS_VARIANT: Record<ContentBlockSummary["status"], "neutral" | "gold" | "emerald"> = {
  "Never Published": "neutral",
  "Draft changes pending": "gold",
  Published: "emerald",
};

export function ContentManager({ blocks, canEdit }: { blocks: ContentBlockSummary[]; canEdit: boolean }) {
  const [openId, setOpenId] = useState<ContentBlockId | null>(null);

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-ink-500">
        Edit the text shown in key sections of the public site. Changes are
        saved as a draft first — nothing visitors see changes until you
        publish.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((b) => (
          <Card key={b.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-navy-400" aria-hidden />
                <p className="font-heading text-sm font-bold text-navy-900">{b.label}</p>
              </div>
              <Badge variant={STATUS_VARIANT[b.status]}>{b.status}</Badge>
            </div>
            <p className="mt-3 text-xs text-ink-500">
              {b.status === "Never Published"
                ? "Not edited yet — showing the site's default text."
                : `Last updated by ${b.updatedByName}`}
            </p>
            {canEdit && (
              <Button size="sm" variant="outline" className="mt-4" onClick={() => setOpenId(b.id)}>
                Edit
              </Button>
            )}
          </Card>
        ))}
      </div>

      {openId && (
        <BlockEditor id={openId} label={blocks.find((b) => b.id === openId)!.label} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}

const initialState: ContentSaveFormState = undefined;

function BlockEditor({ id, label, onClose }: { id: ContentBlockId; label: string; onClose: () => void }) {
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [hasPublished, setHasPublished] = useState(false);
  const [state, formAction, pending] = useActionState(saveContentDraft.bind(null, id), initialState);
  const [publishing, startPublish] = useTransition();
  const [published, setPublished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getContentBlockForEdit(id).then((result) => {
      if (!cancelled) {
        setDraft(result.draft);
        setHasPublished(result.hasPublished);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <p className="font-heading text-base font-bold text-navy-900">Editing: {label}</p>
        <Button size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {!draft ? (
        <p className="mt-4 text-sm text-ink-400">Loading…</p>
      ) : (
        <form action={formAction} className="mt-4 space-y-4">
          <FieldsForBlock id={id} draft={draft} />

          {state && "error" in state && state.error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {state.error}
            </p>
          )}
          {state && "success" in state && state.success && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              Draft saved.
            </p>
          )}
          {published && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              Published — live on the public site now.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save Draft"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={publishing}
              onClick={() =>
                startPublish(async () => {
                  await publishContentBlock(id);
                  setPublished(true);
                })
              }
            >
              {publishing ? "Publishing…" : hasPublished ? "Publish Draft" : "Publish"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

function FieldsForBlock({ id, draft }: { id: ContentBlockId; draft: Record<string, string> }) {
  switch (id) {
    case "homepage-hero":
      return (
        <>
          <Field label="Hero title" htmlFor="cb-title" required>
            <Input id="cb-title" name="title" defaultValue={draft.title ?? ""} required />
          </Field>
          <Field label="Hero description" htmlFor="cb-description" required>
            <Textarea id="cb-description" name="description" rows={3} defaultValue={draft.description ?? ""} required />
          </Field>
        </>
      );
    case "privacy-policy":
    case "terms-of-use":
      return (
        <>
          <Field label="Last updated (shown to visitors)" htmlFor="cb-updated" required>
            <Input id="cb-updated" name="updated" defaultValue={draft.updated ?? ""} required />
          </Field>
          <Field
            label="Body"
            htmlFor="cb-body"
            required
            hint={'Start each section with "## Heading" on its own line, e.g. "## Data Retention". Leave a blank line between paragraphs.'}
          >
            <Textarea id="cb-body" name="body" rows={16} defaultValue={draft.body ?? ""} required className="font-mono text-xs" />
          </Field>
        </>
      );
    default:
      return (
        <Field label="Text" htmlFor="cb-text" required>
          <Textarea id="cb-text" name="text" rows={4} defaultValue={draft.text ?? ""} required />
        </Field>
      );
  }
}
