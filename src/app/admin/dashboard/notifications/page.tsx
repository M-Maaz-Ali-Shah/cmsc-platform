import { NotificationsManager } from "@/components/admin/notifications-manager";
import { getNotificationSettings, listNotificationLog } from "@/app/actions/notifications";
import { requireUser } from "@/lib/auth/dal";

export default async function AdminNotificationsPage() {
  const user = await requireUser();
  const [settings, log] = await Promise.all([getNotificationSettings(), listNotificationLog(50)]);

  return (
    <NotificationsManager
      settings={settings}
      log={log}
      canEdit={["super_admin", "committee_admin"].includes(user.role)}
    />
  );
}
