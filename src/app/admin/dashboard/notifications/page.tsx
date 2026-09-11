import { BellRing } from "lucide-react";
import { SectionPlaceholder } from "@/components/admin/section-placeholder";

export default function AdminNotificationsPage() {
  return (
    <SectionPlaceholder
      icon={BellRing}
      title="Notifications"
      description="Control what happens automatically when an announcement is published — email alerts, browser notifications, and social sharing."
      bullets={[
        "Toggle email notifications for subscribers",
        "Toggle browser push notifications",
        "Generate ready-to-post social media copy",
      ]}
    />
  );
}
