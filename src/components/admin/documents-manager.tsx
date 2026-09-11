"use client";

import { useActionState, useState, useTransition } from "react";
import { Download, FileText, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDocument, deleteDocument } from "@/app/actions/documents";
import { DOCUMENT_CATEGORIES, type DocumentFormState } from "@/lib/validation/document";
import type { schema } from "@/db/client";

type DocumentRow = typeof schema.documents.$inferSelect;

const initialState: DocumentFormState = undefined;

export function DocumentsManager({ documents, canEdit }: { documents: DocumentRow[]; canEdit: boolean }) {
  const [composing, setComposing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(createDocument, initialState);

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
          Upload and organise official PDFs shown on the public Documents page.
        </p>
        {canEdit && <Button onClick={() => setComposing((v) => !v)}>{composing ? "Close" : "Upload Document"}</Button>}
      </div>

      {composing && canEdit && (
        <Card className="p-6">
          <form key={formKey} action={formAction} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="doc-title" required className="sm:col-span-2">
              <Input id="doc-title" name="title" required />
            </Field>
            <Field label="Category" htmlFor="doc-category" required>
              <select
                id="doc-category"
                name="category"
                required
                defaultValue="Statement"
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Publish date" htmlFor="doc-date" required>
              <Input id="doc-date" name="date" type="date" required />
            </Field>
            <Field label="Description (optional)" htmlFor="doc-description" className="sm:col-span-2">
              <Textarea id="doc-description" name="description" rows={2} />
            </Field>
            <Field label="PDF file" htmlFor="doc-file" required className="sm:col-span-2">
              <input
                id="doc-file"
                name="file"
                type="file"
                accept="application/pdf"
                required
                className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
              />
            </Field>
            {state?.error && (
              <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {state.error}
              </p>
            )}
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {documents.map((doc) => (
          <DocumentRowCard key={doc.id} doc={doc} canEdit={canEdit} />
        ))}
        {documents.length === 0 && <p className="text-sm text-ink-400">No documents uploaded yet.</p>}
      </div>
    </div>
  );
}

function DocumentRowCard({ doc, canEdit }: { doc: DocumentRow; canEdit: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
          <FileText className="size-5" aria-hidden />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-base font-bold text-navy-900">{doc.title}</p>
            <Badge variant="navy">{doc.category}</Badge>
          </div>
          {doc.description && <p className="mt-1 text-sm text-ink-500">{doc.description}</p>}
          <p className="mt-1 text-xs text-ink-300">Published {doc.date}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2 sm:ml-4">
        <Button asChild variant="outline">
          <a href={`/api/files/${doc.fileKey}`} target="_blank" rel="noreferrer">
            <Download className="size-4" aria-hidden />
          </a>
        </Button>
        {canEdit && (
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => {
              if (confirm(`Remove "${doc.title}"?`)) startTransition(() => deleteDocument(doc.id));
            }}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </Card>
  );
}
