ALTER TABLE `tenant_settings` ADD COLUMN `reply_mode` varchar(32) NOT NULL DEFAULT 'webhook_only';--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD COLUMN `reply_mailbox_email` varchar(255);--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD COLUMN `reply_mailbox_verified` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD COLUMN `reply_mailbox_otp` varchar(255);--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD COLUMN `reply_mailbox_otp_expires_at` datetime;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD COLUMN `inbound_parse_verified` boolean NOT NULL DEFAULT false;
