CREATE TABLE `reply_tokens` (
	`token_hash` varchar(64) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`communication_id` varchar(36),
	`invoice_id` varchar(36),
	`expires_at` datetime,
	`revoked_at` datetime,
	`last_used_at` datetime,
	`reply_count` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `reply_tokens_token_hash` PRIMARY KEY(`token_hash`)
);
--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `reply_mode` varchar(32) DEFAULT 'webhook_only' NOT NULL;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `reply_mailbox_email` varchar(255);--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `reply_mailbox_verified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `reply_mailbox_otp` varchar(255);--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `reply_mailbox_otp_expires_at` datetime;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `inbound_parse_verified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD `inbound_domain` varchar(255);--> statement-breakpoint
ALTER TABLE `reply_tokens` ADD CONSTRAINT `reply_tokens_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reply_tokens` ADD CONSTRAINT `reply_tokens_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `reply_tokens_tenant_comm_idx` ON `reply_tokens` (`tenant_id`,`communication_id`);--> statement-breakpoint
CREATE INDEX `reply_tokens_tenant_inv_idx` ON `reply_tokens` (`tenant_id`,`invoice_id`);--> statement-breakpoint
CREATE INDEX `reply_tokens_expires_at_idx` ON `reply_tokens` (`expires_at`);