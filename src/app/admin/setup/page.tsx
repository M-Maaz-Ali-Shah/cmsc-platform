import { eq } from "drizzle-orm";
import { ShieldAlert, ShieldCheck } from "lucide-react";

import { LogoLockup } from "@/components/brand/logo-lockup";
import { Card } from "@/components/ui/card";
import { getDb, schema } from "@/db/client";
import { SetupForm } from "./setup-form";

export default async function AdminSetupPage({
  searchParams,
}: PageProps<"/admin/setup">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  const db = await getDb();
  const existingAdmins = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.role, "super_admin"))
    .limit(1);
  const alreadyConfigured = existingAdmins.length > 0;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-16 text-white">
      <div className="crescent-field pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <LogoLockup variant="onDark" />
        </div>

        <Card className="border-white/10 bg-surface/95 p-7 sm:p-9">
          {alreadyConfigured ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                <ShieldCheck className="size-6" aria-hidden />
              </div>
              <h1 className="mt-4 font-heading text-xl font-bold text-navy-900">
                Setup already complete
              </h1>
              <p className="mt-2 text-sm text-ink-500">
                A Super Admin account already exists for this site. This
                one-time setup page can no longer be used. Ask an existing
                Super Admin to create your account from the dashboard&rsquo;s
                Team section, or sign in below if that&rsquo;s you.
              </p>
              <a
                href="/admin/login"
                className="mt-5 inline-block rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Go to sign in
              </a>
            </div>
          ) : !token ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
                <ShieldAlert className="size-6" aria-hidden />
              </div>
              <h1 className="mt-4 font-heading text-xl font-bold text-navy-900">
                Setup token required
              </h1>
              <p className="mt-2 text-sm text-ink-500">
                Open this page with your{" "}
                <code className="rounded bg-navy-50 px-1 py-0.5 text-xs">
                  ADMIN_SETUP_TOKEN
                </code>{" "}
                as a query parameter, e.g.{" "}
                <code className="break-all rounded bg-navy-50 px-1 py-0.5 text-xs">
                  /admin/setup?token=YOUR_TOKEN
                </code>
                . See DEPLOY.md for where this token is set.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                  <ShieldCheck className="size-6" aria-hidden />
                </div>
                <h1 className="mt-4 font-heading text-xl font-bold text-navy-900">
                  Create the Super Admin account
                </h1>
                <p className="mt-1 text-sm text-ink-500">
                  This runs once. Choose a strong password — this account
                  can manage every part of the site.
                </p>
              </div>
              <SetupForm token={token} />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
