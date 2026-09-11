CREATE TABLE `notification_log` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`recipient` text NOT NULL,
	`status` text NOT NULL,
	`related_entity` text,
	`failure_reason` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`sent_at` integer
);
