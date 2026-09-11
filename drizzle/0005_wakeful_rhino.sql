ALTER TABLE `subscribers` ADD `confirmed` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `confirm_token_hash` text;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `confirm_expires_at` integer;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `unsubscribe_token` text;