import { Suspense } from "react";
import type { Metadata } from "next";
import { KeyRound } from "lucide-react";

import { LogoLockup } from "@/components/brand/logo-lockup";
import { Card } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-16 text-white">
      <div className="crescent-field pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <LogoLockup variant="onDark" />
        </div>

        <Card className="border-white/10 bg-surface/95 p-7 sm:p-9">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-700">
              <KeyRound className="size-6" aria-hidden />
            </div>
            <h1 className="mt-4 font-heading text-xl font-bold text-navy-900">Set a New Password</h1>
          </div>

          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
