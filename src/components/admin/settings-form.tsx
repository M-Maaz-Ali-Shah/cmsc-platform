"use client";

import { useActionState } from "react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateSettings } from "@/app/actions/settings";
import type { SettingsFormState, SettingsValues } from "@/lib/validation/settings";

const initialState: SettingsFormState = undefined;

export function SettingsForm({ initial, canEdit }: { initial: SettingsValues; canEdit: boolean }) {
  const [state, formAction, pending] = useActionState(updateSettings, initialState);

  return (
    <form action={formAction} className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label="Site name" htmlFor="s-name">
        <Input id="s-name" name="siteName" defaultValue={initial.siteName} disabled={!canEdit} />
      </Field>
      <Field label="Support email" htmlFor="s-email" hint="Shown on the public Contact page once set.">
        <Input id="s-email" name="supportEmail" type="email" defaultValue={initial.supportEmail} disabled={!canEdit} placeholder="Not yet set" />
      </Field>
      <Field label="Facebook page URL (optional)" htmlFor="s-fb">
        <Input id="s-fb" name="facebookUrl" type="url" defaultValue={initial.facebookUrl} disabled={!canEdit} placeholder="https://facebook.com/…" />
      </Field>
      <Field label="YouTube channel URL (optional)" htmlFor="s-yt">
        <Input id="s-yt" name="youtubeUrl" type="url" defaultValue={initial.youtubeUrl} disabled={!canEdit} placeholder="https://youtube.com/…" />
      </Field>
      <Field label="Default language" htmlFor="s-lang">
        <select
          id="s-lang"
          name="defaultLanguage"
          defaultValue={initial.defaultLanguage}
          disabled={!canEdit}
          className="h-11 w-full rounded-md border border-border-subtle bg-paper px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold-600 disabled:opacity-60"
        >
          <option value="en">English</option>
          <option value="ur">اردو (Urdu)</option>
          <option value="ar">العربية (Arabic)</option>
        </select>
      </Field>
      <Field label="Time zone" htmlFor="s-tz">
        <Input id="s-tz" name="timezone" defaultValue={initial.timezone} disabled={!canEdit} />
      </Field>

      {state?.error && (
        <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="sm:col-span-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
          Settings saved.
        </p>
      )}

      {canEdit && (
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      )}
    </form>
  );
}
