export const NOTIFICATION_TYPES = [
  "sighting_new",
  "sighting_status",
  "reviewer_assigned",
  "announcement_published",
  "contact_new",
  "team_created",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  sighting_new: "New sighting report submitted",
  sighting_status: "Sighting report status changed",
  reviewer_assigned: "Reviewer assigned to a report",
  announcement_published: "Announcement published (subscriber emails)",
  contact_new: "New contact message received",
  team_created: "Team account created",
};

export const NOTIFICATION_TYPE_DESCRIPTIONS: Record<NotificationType, string> = {
  sighting_new: "Emails the support address when a new sighting report is submitted publicly.",
  sighting_status: "Emails the observer when their report's status changes.",
  reviewer_assigned: "Emails a reviewer when they're assigned to a report.",
  announcement_published: "Emails every subscriber when an announcement is published.",
  contact_new: "Emails the support address when a visitor submits the contact form.",
  team_created: "Emails a new team member letting them know an account was created for them.",
};

export type NotificationSettings = { masterEnabled: boolean } & Record<NotificationType, boolean>;

export const NOTIFICATION_SETTINGS_DEFAULTS: NotificationSettings = {
  masterEnabled: true,
  sighting_new: true,
  sighting_status: true,
  reviewer_assigned: true,
  announcement_published: true,
  contact_new: true,
  team_created: true,
};
