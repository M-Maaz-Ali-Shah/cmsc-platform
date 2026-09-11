"use client";

import { useActionState } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import type { NewsletterFormState } from "@/lib/validation/contact";

const initialState: NewsletterFormState = undefined;

export function Newsletter() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-border-subtle bg-surface px-6 py-12 text-center sm:px-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-700">
            <BellRing className="size-6" aria-hidden />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
              Stay Informed
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
              Get official announcements delivered as soon as they are
              published. No spam — moon-sighting updates only.
            </p>
          </div>

          {state?.success ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" aria-hidden />
              Almost there — check your inbox to confirm your subscription.
            </p>
          ) : (
            <form action={formAction} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="newsletter-website">Website</label>
                <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="h-11 flex-1 rounded-md border border-border-subtle bg-paper px-4 text-sm text-ink-900 outline-none placeholder:text-ink-300 focus-visible:ring-2 focus-visible:ring-gold-600"
              />
              <Button type="submit" variant="emerald" size="default" disabled={pending}>
                {pending ? "Subscribing…" : "Get Updates"}
              </Button>
            </form>
          )}
          {state?.error && <p className="text-xs font-medium text-red-700">{state.error}</p>}
        </div>
      </Container>
    </section>
  );
}
