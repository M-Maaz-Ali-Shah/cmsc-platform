import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Megaphone,
  FileSearch,
  Users,
  UserRound,
  MapPinned,
  CalendarDays,
  FolderOpen,
  ImageIcon,
  FileCode2,
  BellRing,
  Settings,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export const adminNav: AdminNavItem[] = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Announcements", href: "/admin/dashboard/announcements", icon: Megaphone },
  { label: "Sighting Reports", href: "/admin/dashboard/reports", icon: FileSearch, badge: 9 },
  { label: "Observers", href: "/admin/dashboard/observers", icon: Users },
  { label: "Committee Members", href: "/admin/dashboard/committee", icon: UserRound },
  { label: "Regional Representatives", href: "/admin/dashboard/regions", icon: MapPinned },
  { label: "Islamic Calendar", href: "/admin/dashboard/calendar", icon: CalendarDays },
  { label: "Documents", href: "/admin/dashboard/documents", icon: FolderOpen },
  { label: "Media", href: "/admin/dashboard/media", icon: ImageIcon },
  { label: "Website Content", href: "/admin/dashboard/content", icon: FileCode2 },
  { label: "Contact Messages", href: "/admin/dashboard/contact-messages", icon: MessageSquare },
  { label: "Notifications", href: "/admin/dashboard/notifications", icon: BellRing },
  { label: "Settings", href: "/admin/dashboard/settings", icon: Settings },
  { label: "Audit Logs", href: "/admin/dashboard/audit-logs", icon: ShieldCheck },
];
