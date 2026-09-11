import { Settings } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getSettings } from "@/app/actions/settings";
import { requireUser } from "@/lib/auth/dal";
import { SettingsForm } from "@/components/admin/settings-form";

const roles = [
  { role: "Super Admin", access: "Full control over every area of the platform." },
  { role: "Committee Admin", access: "Manage announcements, reports, and committee content." },
  { role: "Reviewer", access: "Review and triage sighting reports." },
  { role: "Regional Representative", access: "Manage their region's information and reports." },
  { role: "Observer", access: "Submit and manage their own reports." },
  { role: "Public User", access: "Read announcements and submit reports — no account needed." },
];

export default async function AdminSettingsPage() {
  const user = await requireUser();
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Settings className="size-5 text-emerald-700" aria-hidden />
          <p className="font-heading text-base font-bold text-navy-900">General Settings</p>
        </div>
        <SettingsForm
          initial={settings}
          canEdit={["super_admin", "committee_admin"].includes(user.role)}
        />
      </Card>

      <Card className="p-6">
        <p className="font-heading text-base font-bold text-navy-900">Roles &amp; Permissions</p>
        <p className="mt-1 text-sm text-ink-500">Reference — who can do what across the dashboard.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <tbody>
              {roles.map((r) => (
                <tr key={r.role} className="border-b border-border-subtle last:border-0">
                  <td className="whitespace-nowrap py-3 pr-4 font-semibold text-navy-900">{r.role}</td>
                  <td className="py-3 text-ink-500">{r.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
