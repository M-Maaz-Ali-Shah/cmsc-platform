CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`month` text NOT NULL,
	`hijri_year` text NOT NULL,
	`gregorian_year` text NOT NULL,
	`decision` text NOT NULL,
	`summary` text NOT NULL,
	`statement` text NOT NULL,
	`region` text DEFAULT 'Great Britain & Europe' NOT NULL,
	`type` text DEFAULT 'Month Start' NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`public_status` text DEFAULT 'Confirmed' NOT NULL,
	`pdf_key` text,
	`created_by_name` text NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `announcements_slug_unique` ON `announcements` (`slug`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_name` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `calendar_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`hijri_month` text NOT NULL,
	`hijri_year` text NOT NULL,
	`astronomical_estimate` text,
	`official_status` text DEFAULT 'Upcoming' NOT NULL,
	`official_date` text,
	`announcement_slug` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `committee_members` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`region` text NOT NULL,
	`bio` text,
	`photo_key` text,
	`approved` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`date` text NOT NULL,
	`file_key` text NOT NULL,
	`file_name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`type` text NOT NULL,
	`file_key` text,
	`video_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`group` text NOT NULL,
	`representative_user_id` text,
	`status` text DEFAULT 'Awaiting Representative' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `report_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`report_id` text NOT NULL,
	`author_name` text NOT NULL,
	`note` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `sighting_reports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sighting_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`report_ref` text NOT NULL,
	`observer_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`country` text NOT NULL,
	`city` text NOT NULL,
	`region` text NOT NULL,
	`observation_date` text NOT NULL,
	`observation_time` text NOT NULL,
	`location` text NOT NULL,
	`weather` text NOT NULL,
	`visibility` text NOT NULL,
	`moon_observed` integer NOT NULL,
	`method` text NOT NULL,
	`direction` text,
	`altitude` integer,
	`duration` integer,
	`description` text,
	`photo_key` text,
	`evidence_key` text,
	`status` text DEFAULT 'Submitted' NOT NULL,
	`reviewer_id` text,
	`consent` integer NOT NULL,
	`submitted_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sighting_reports_report_ref_unique` ON `sighting_reports` (`report_ref`);--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`region_id` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `website_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
