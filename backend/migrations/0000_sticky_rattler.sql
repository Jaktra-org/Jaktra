CREATE TABLE `agent_run_chunks` (
	`id` varchar(36) NOT NULL,
	`run_id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`chunk_index` int NOT NULL,
	`total_chunks` int NOT NULL,
	`invoice_ids` json NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'queued',
	`invoices_processed` int NOT NULL DEFAULT 0,
	`emails_sent` int NOT NULL DEFAULT 0,
	`errors` int NOT NULL DEFAULT 0,
	`error_details` text,
	`start_time` datetime,
	`end_time` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `agent_run_chunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_runs` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'running',
	`start_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`end_time` datetime,
	`invoices_processed` int NOT NULL DEFAULT 0,
	`emails_sent` int NOT NULL DEFAULT 0,
	`errors` int NOT NULL DEFAULT 0,
	`error_details` text,
	`chunk_size` int NOT NULL DEFAULT 10,
	`total_invoices` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `agent_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communications` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`invoice_id` varchar(36) NOT NULL,
	`channel` enum('email','sms','whatsapp') NOT NULL,
	`subject` text,
	`body` text,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`sent_at` datetime,
	`opened_at` datetime,
	`clicked_at` datetime,
	`error` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `communications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dlq_entries` (
	`invoice_id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`consecutive_failures` int NOT NULL DEFAULT 1,
	`last_error` text,
	`last_error_display` text,
	`last_error_technical` text,
	`first_failure` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_failure` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `dlq_entries_invoice_id` PRIMARY KEY(`invoice_id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`entity_type` varchar(50) NOT NULL DEFAULT 'invoice',
	`entity_id` varchar(36) NOT NULL,
	`actor_id` varchar(36),
	`actor_name` text,
	`actor_email` varchar(255),
	`actor_role` varchar(50),
	`action_type` varchar(100) NOT NULL DEFAULT 'legacy.event',
	`description` text,
	`source` varchar(50) NOT NULL DEFAULT 'system',
	`old_values` json,
	`new_values` json,
	`event_type` varchar(100) NOT NULL,
	`payload` json,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inbound_emails` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`invoice_id` varchar(36),
	`sender` varchar(255) NOT NULL,
	`subject` text,
	`body` text,
	`classification` varchar(100),
	`confidence` decimal(4,3),
	`suggested_response` text,
	`reasoning` text,
	`status` enum('pending_review','approved','discarded') NOT NULL DEFAULT 'pending_review',
	`reviewed_by` varchar(36),
	`reviewed_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`source` varchar(50) NOT NULL DEFAULT 'email',
	CONSTRAINT `inbound_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_payment_links` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`invoice_id` varchar(36) NOT NULL,
	`provider` enum('sendgrid','smtp','razorpay') NOT NULL,
	`provider_payment_link_id` varchar(255) NOT NULL,
	`provider_order_id` varchar(255),
	`payment_url` text NOT NULL,
	`status` enum('active','paid','expired','cancelled') NOT NULL DEFAULT 'active',
	`amount` decimal(14,2) NOT NULL,
	`currency` varchar(10) NOT NULL,
	`metadata` json,
	`expires_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `invoice_payment_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoice_payment_links_tenant_invoice_provider_uniq` UNIQUE(`tenant_id`,`invoice_id`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `invoice_portal_links` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`invoice_id` varchar(36) NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`revoked_at` datetime,
	`viewed_at` datetime,
	CONSTRAINT `invoice_portal_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoice_portal_links_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`invoice_no` varchar(255) NOT NULL,
	`client_name` text NOT NULL,
	`invoice_amount` decimal(14,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'INR',
	`due_date` date NOT NULL,
	`contact_email` varchar(255) NOT NULL,
	`subject` text,
	`payment_status` enum('Pending','Paid','Overdue','Written Off') NOT NULL DEFAULT 'Pending',
	`followup_count` int NOT NULL DEFAULT 0,
	`last_followup_date` datetime,
	`external_ref_id` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	`has_active_payment_plan` boolean NOT NULL DEFAULT false,
	`payment_status_changed_at` datetime,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoice_no_tenant_id_uniq` UNIQUE(`invoice_no`,`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `payment_plan_requests` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`invoice_id` varchar(36) NOT NULL,
	`installments` int NOT NULL,
	`proposed_amount_per_month` decimal(14,2) NOT NULL,
	`reason` text,
	`status` enum('pending','approved','denied','cancelled') NOT NULL DEFAULT 'pending',
	`reviewed_by` varchar(36),
	`reviewed_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `payment_plan_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_webhook_events` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`provider` enum('sendgrid','smtp','razorpay') NOT NULL,
	`external_event_id` varchar(255) NOT NULL,
	`payment_id` varchar(255),
	`invoice_id` varchar(36),
	`status` varchar(50) NOT NULL,
	`raw_payload` json,
	`received_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`processed_at` datetime,
	CONSTRAINT `payment_webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_webhook_events_tenant_provider_external_event_uniq` UNIQUE(`tenant_id`,`provider`,`external_event_id`)
);
--> statement-breakpoint
CREATE TABLE `team_invitations` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('admin','manager','viewer') NOT NULL DEFAULT 'viewer',
	`token_hash` varchar(255) NOT NULL,
	`invited_by_user_id` varchar(36),
	`expires_at` datetime NOT NULL,
	`accepted_at` datetime,
	`revoked_at` datetime,
	`delivery_status` varchar(50) NOT NULL DEFAULT 'pending',
	`delivery_error` text,
	`last_sent_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `team_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `team_invitations_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `tenant_integrations` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`provider` enum('sendgrid','smtp','razorpay') NOT NULL,
	`ciphertext` text NOT NULL,
	`iv` varchar(100) NOT NULL,
	`auth_tag` varchar(100) NOT NULL,
	`key_version` int NOT NULL DEFAULT 1,
	`last_validated_at` datetime,
	`last_validation_result` enum('valid','invalid','revoked','insufficient_scope','unverified_sender','unknown') NOT NULL DEFAULT 'unknown',
	`last_operational_error_code` varchar(100),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `tenant_integrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_integrations_tenant_provider_uniq` UNIQUE(`tenant_id`,`provider`)
);
--> statement-breakpoint
CREATE TABLE `tenant_settings` (
	`tenant_id` varchar(36) NOT NULL,
	`company_name` text NOT NULL DEFAULT ('Company'),
	`sender_name` text NOT NULL,
	`sender_email` varchar(255) NOT NULL,
	`reply_to` varchar(255),
	`payment_link` text,
	`bank_details` text,
	`timezone` varchar(100) NOT NULL DEFAULT 'UTC',
	`schedule_hour` int NOT NULL DEFAULT 9,
	`idempotency_window_hours` int NOT NULL DEFAULT 20,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`default_email_provider` enum('sendgrid','smtp'),
	`webhook_token` varchar(255),
	`skip_payment_warning` boolean NOT NULL DEFAULT false,
	`auto_purge_enabled` boolean NOT NULL DEFAULT false,
	`auto_purge_days` int NOT NULL DEFAULT 30,
	`dlq_threshold` int NOT NULL DEFAULT 3,
	`mfa_required` boolean NOT NULL DEFAULT false,
	`dns_verified_at` datetime,
	`inbound_blocked_by_admin` boolean NOT NULL DEFAULT false,
	CONSTRAINT `tenant_settings_tenant_id` PRIMARY KEY(`tenant_id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`slug` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`tenant_id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` text NOT NULL,
	`role` enum('admin','manager','viewer') NOT NULL DEFAULT 'viewer',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`mfa_enabled` boolean NOT NULL DEFAULT false,
	`mfa_secret` text,
	`mfa_secret_iv` text,
	`mfa_secret_auth_tag` text,
	`mfa_secret_key_version` int,
	`mfa_backup_codes` text,
	`mfa_last_used_step` int,
	`email_verified` boolean NOT NULL DEFAULT false,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_tenant_id_uniq` UNIQUE(`email`,`tenant_id`)
);
--> statement-breakpoint
ALTER TABLE `agent_run_chunks` ADD CONSTRAINT `agent_run_chunks_run_id_agent_runs_id_fk` FOREIGN KEY (`run_id`) REFERENCES `agent_runs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_run_chunks` ADD CONSTRAINT `agent_run_chunks_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_runs` ADD CONSTRAINT `agent_runs_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `communications` ADD CONSTRAINT `communications_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `communications` ADD CONSTRAINT `communications_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dlq_entries` ADD CONSTRAINT `dlq_entries_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dlq_entries` ADD CONSTRAINT `dlq_entries_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_actor_id_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inbound_emails` ADD CONSTRAINT `inbound_emails_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inbound_emails` ADD CONSTRAINT `inbound_emails_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inbound_emails` ADD CONSTRAINT `inbound_emails_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_payment_links` ADD CONSTRAINT `invoice_payment_links_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_payment_links` ADD CONSTRAINT `invoice_payment_links_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_portal_links` ADD CONSTRAINT `invoice_portal_links_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_portal_links` ADD CONSTRAINT `invoice_portal_links_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_plan_requests` ADD CONSTRAINT `payment_plan_requests_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_plan_requests` ADD CONSTRAINT `payment_plan_requests_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_plan_requests` ADD CONSTRAINT `payment_plan_requests_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_webhook_events` ADD CONSTRAINT `payment_webhook_events_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_webhook_events` ADD CONSTRAINT `payment_webhook_events_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_invited_by_user_id_users_id_fk` FOREIGN KEY (`invited_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_integrations` ADD CONSTRAINT `tenant_integrations_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_settings` ADD CONSTRAINT `tenant_settings_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `agent_run_chunks_run_id_idx` ON `agent_run_chunks` (`run_id`);--> statement-breakpoint
CREATE INDEX `agent_run_chunks_tenant_status_idx` ON `agent_run_chunks` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `agent_runs_tenant_id_start_time_idx` ON `agent_runs` (`tenant_id`,`start_time`);--> statement-breakpoint
CREATE INDEX `communications_tenant_id_idx` ON `communications` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `communications_invoice_id_status_sent_at_idx` ON `communications` (`invoice_id`,`status`,`sent_at`);--> statement-breakpoint
CREATE INDEX `dlq_entries_tenant_id_idx` ON `dlq_entries` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `events_entity_audit_idx` ON `events` (`tenant_id`,`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `events_actor_id_idx` ON `events` (`actor_id`);--> statement-breakpoint
CREATE INDEX `events_action_type_idx` ON `events` (`tenant_id`,`action_type`,`created_at`);--> statement-breakpoint
CREATE INDEX `events_source_idx` ON `events` (`tenant_id`,`source`,`created_at`);--> statement-breakpoint
CREATE INDEX `inbound_emails_tenant_id_status_idx` ON `inbound_emails` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `inbound_emails_invoice_id_idx` ON `inbound_emails` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `invoice_payment_links_tenant_id_idx` ON `invoice_payment_links` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `invoice_payment_links_invoice_id_idx` ON `invoice_payment_links` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `invoice_payment_links_provider_link_id_idx` ON `invoice_payment_links` (`provider_payment_link_id`);--> statement-breakpoint
CREATE INDEX `invoice_portal_links_token_hash_idx` ON `invoice_portal_links` (`token_hash`);--> statement-breakpoint
CREATE INDEX `invoice_portal_links_invoice_id_idx` ON `invoice_portal_links` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `invoices_tenant_id_payment_status_idx` ON `invoices` (`tenant_id`,`payment_status`);--> statement-breakpoint
CREATE INDEX `invoices_external_ref_id_idx` ON `invoices` (`external_ref_id`);--> statement-breakpoint
CREATE INDEX `payment_plan_requests_tenant_id_status_idx` ON `payment_plan_requests` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `payment_plan_requests_invoice_id_idx` ON `payment_plan_requests` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `payment_webhook_events_tenant_id_idx` ON `payment_webhook_events` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `payment_webhook_events_invoice_id_idx` ON `payment_webhook_events` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `payment_webhook_events_payment_id_idx` ON `payment_webhook_events` (`payment_id`);