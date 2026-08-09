UPDATE `inbound_emails` SET `status` = 'pending' WHERE `status` = 'pending_review';
--> statement-breakpoint
UPDATE `inbound_emails` SET `status` = 'resolved' WHERE `status` = 'approved';
--> statement-breakpoint
UPDATE `inbound_emails` SET `status` = 'archived' WHERE `status` = 'discarded';
--> statement-breakpoint
ALTER TABLE `inbound_emails` DROP COLUMN `suggested_response`;
--> statement-breakpoint
ALTER TABLE `inbound_emails` MODIFY COLUMN `status` enum('pending','resolved','archived') NOT NULL DEFAULT 'pending';
--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD COLUMN `auto_purge_archived_disputes_days` int DEFAULT 30;
