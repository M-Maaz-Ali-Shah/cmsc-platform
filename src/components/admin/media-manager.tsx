"use client";

import { useActionState, useState, useTransition } from "react";
import { ImageIcon, PlayCircle, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createMedia, deleteMedia } from "@/app/actions/media";
import { MEDIA_CATEGORIES, type MediaFormState } from "@/lib/validation/media";
import type { schema } from "@/db/client";

type MediaRow = typeof schema.media.$inferSelect;

const initialState: MediaFormState = undefined;

export function MediaManager({ items, canEdit }: { items: MediaRow[]; canEdit: boolean }) {
  const [composing, setComposing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [type, setType] = useState<"photo" | "video">("photo");
  const [state, formAction, pending] = useActionState(createMedia, initialState);

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
          Upload photos or link videos shown in the public Media gallery.
        </p>
        {canEdit && <Button onClick={() => setComposing((v) => !v)}>{composing ? "Close" : "Add Media"}</Button>}
      </div>

      {composing && canEdit && (
        <Card className="p-6">
          <form key={formKey} action={formAction} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="md-title" required className="sm:col-span-2">
              <Input id="md-title" name="title" required />
            </Field>
            <Field label="Category" htmlFor="md-category" required>
              <select
                id="md-category"
                name="category"
                required
                defaultValue="Moon Sightings"
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                {MEDIA_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type" htmlFor="md-type" required>
              <select
                id="md-type"
                name="type"
                required
                value={type}
                onChange={(e) => setType(e.target.value as "photo" | "video")}
                className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                <option value="photo">Photo</option>
                <option value="video">Video (external link)</option>
              </select>
            </Field>
            {type === "photo" ? (
              <Field label="Photo" htmlFor="md-photo" required className="sm:col-span-2">
                <input
                  id="md-photo"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                />
              </Field>
            ) : (
              <Field label="Video URL" htmlFor="md-video" required className="sm:col-span-2" hint="YouTube, Vimeo, or other external link.">
                <Input id="md-video" name="videoUrl" type="url" placeholder="https://…" />
              </Field>
            )}
            {state?.error && (
              <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {state.error}
              </p>
            )}
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Add Media"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} canEdit={canEdit} />
        ))}
        {items.length === 0 && <p className="col-span-full text-sm text-ink-400">No media uploaded yet.</p>}
      </div>
    </div>
  );
}

function MediaCard({ item, canEdit }: { item: MediaRow; canEdit: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 p-4 text-white">
      {item.fileKey && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/files/${item.fileKey}`} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
      )}
      <div className="relative flex items-center gap-2 text-gold-400">
        {item.type === "video" ? <PlayCircle className="size-5" aria-hidden /> : <ImageIcon className="size-5" aria-hidden />}
        <span className="text-[10px] font-semibold uppercase tracking-wide">{item.category}</span>
      </div>
      <p className="relative mt-2 text-sm font-semibold leading-snug">{item.title}</p>
      {canEdit && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          className="relative mt-3 w-fit bg-white/90 text-navy-900 hover:bg-white"
          aria-label={`Remove ${item.title}`}
          onClick={() => {
            if (confirm(`Remove "${item.title}"?`)) startTransition(() => deleteMedia(item.id));
          }}
        >
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      )}
    </div>
  );
}
